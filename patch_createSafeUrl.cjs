const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace createSafeUrl definition
const safeUrlDefRegex = /function createSafeUrl\([\s\S]*?return id;\n}/m;

const newSafeUrlDef = `const GLOBAL_ALLOWED_DOMAINS = [
  'api.simkl.com',
  'api.myanimelist.net',
  'graphql.anilist.co',
  'rss.plex.tv',
  'api.github.com',
  'www.googleapis.com',
  'graph.microsoft.com',
  'discord.com',
  'discordapp.com',
  'api.openai.com',
  'generativelanguage.googleapis.com'
];

function createSafeUrl(urlString: string, dynamicAllowedHostname?: string): string {
  try {
    const parsedUrl = url.parse(urlString);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error(\`Unsupported protocol: \${parsedUrl.protocol}\`);
    }
    const hostname = parsedUrl.hostname;
    if (!hostname) throw new Error('No hostname found in URL');

    const allowList = [...GLOBAL_ALLOWED_DOMAINS];
    if (dynamicAllowedHostname) allowList.push(dynamicAllowedHostname);
    
    // Always allow explicitly saved server URLs from DB settings
    if (appSettings?.plex?.serverUrl) {
       try { allowList.push(url.parse(appSettings.plex.serverUrl).hostname!); } catch(e){}
    }
    if (appSettings?.jellyfin?.serverUrl) {
       try { allowList.push(url.parse(appSettings.jellyfin.serverUrl).hostname!); } catch(e){}
    }
    if (appSettings?.emby?.serverUrl) {
       try { allowList.push(url.parse(appSettings.emby.serverUrl).hostname!); } catch(e){}
    }
    if (appSettings?.karakeep?.apiUrl) {
       try { allowList.push(url.parse(appSettings.karakeep.apiUrl).hostname!); } catch(e){}
    }
    if (appSettings?.remoteSync?.serverUrl) {
       try { allowList.push(url.parse(appSettings.remoteSync.serverUrl).hostname!); } catch(e){}
    }
    
    // Also allow generic private network ranges for local self-hosting discovery
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

    if (!allowList.includes(hostname) && !isLocal) {
      throw new Error(\`Hostname \${hostname} is not allowed\`);
    }

    if (parsedUrl.pathname && (parsedUrl.pathname.includes('..') || decodeURIComponent(parsedUrl.pathname).includes('..'))) {
      throw new Error('Path traversal detected in URL.');
    }
    return parsedUrl.href;
  } catch (error: any) {
    throw new Error(\`Invalid URL: \${error.message}\`);
  }
}

function sanitizeIdParam(id: string | undefined): string {
  if (!id) return '';
  if (id.includes("..") || id.includes("?") || id.includes("#") || id.includes("\\n") || id.includes("\\r")) {
    throw new Error('Invalid path parameter format.');
  }
  return id;
}`;

code = code.replace(/function createSafeUrl\([\s\S]*?return id;\n}/, newSafeUrlDef);
fs.writeFileSync('server.ts', code);
