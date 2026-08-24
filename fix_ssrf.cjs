const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const helpers = `
// CodeQL SSRF Mitigation Helpers
function createSafeUrl(urlString: string, allowedHostnames?: string[]): URL {
  try {
    const parsedUrl = new URL(urlString);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error(\`Unsupported protocol: \${parsedUrl.protocol}\`);
    }
    if (allowedHostnames && allowedHostnames.length > 0) {
       if (!allowedHostnames.includes(parsedUrl.hostname)) {
          throw new Error(\`Hostname \${parsedUrl.hostname} is not allowed\`);
       }
    }
    if (parsedUrl.pathname.includes('..') || decodeURIComponent(parsedUrl.pathname).includes('..')) {
      throw new Error('Path traversal detected in URL.');
    }
    return parsedUrl;
  } catch (error: any) {
    throw new Error(\`Invalid URL: \${error.message}\`);
  }
}

function sanitizeIdParam(id: string | undefined): string {
  if (!id) return '';
  if (id.includes('..') || id.includes('?') || id.includes('#') || /[\x00-\x1F]/.test(id)) {
    throw new Error('Invalid path parameter format.');
  }
  return id;
}
`;

content = content.replace("import { URL } from 'url';", "import { URL } from 'url';\n" + helpers);

content = content.replace(/fetch\('https:\/\/api\.simkl\.com\/oauth\/token',/g, "fetch(createSafeUrl('https://api.simkl.com/oauth/token', ['api.simkl.com']),");
content = content.replace(/fetch\('https:\/\/myanimelist\.net\/v1\/oauth2\/token',/g, "fetch(createSafeUrl('https://myanimelist.net/v1/oauth2/token', ['myanimelist.net']),");
content = content.replace(/fetch\('https:\/\/anilist\.co\/api\/v2\/oauth\/token',/g, "fetch(createSafeUrl('https://anilist.co/api/v2/oauth/token', ['anilist.co']),");
content = content.replace(/fetch\('https:\/\/api\.simkl\.com\/users\/settings',/g, "fetch(createSafeUrl('https://api.simkl.com/users/settings', ['api.simkl.com']),");
content = content.replace(/fetch\('https:\/\/api\.myanimelist\.net\/v2\/users\/@me',/g, "fetch(createSafeUrl('https://api.myanimelist.net/v2/users/@me', ['api.myanimelist.net']),");
content = content.replace(/fetch\('https:\/\/graphql\.anilist\.co',/g, "fetch(createSafeUrl('https://graphql.anilist.co', ['graphql.anilist.co']),");

content = content.replace(/fetch\(\`https:\/\/api\.github\.com\/gists\$\{targetId \? '\/' \+ targetId : ''\}\`,/g, "fetch(createSafeUrl(`https://api.github.com/gists${targetId ? '/' + sanitizeIdParam(targetId) : ''}`, ['api.github.com']),");
content = content.replace(/fetch\(\`https:\/\/api\.github\.com\/gists\/\$\{targetId\}\`,/g, "fetch(createSafeUrl(`https://api.github.com/gists/${sanitizeIdParam(targetId)}`, ['api.github.com']),");

content = content.replace(/fetch\(\`https:\/\/api\.github\.com\/repos\/\$\{owner\}\/\$\{repo\}\/contents\/\$\{path\}\`,/g, "fetch(createSafeUrl(`https://api.github.com/repos/${sanitizeIdParam(owner)}/${sanitizeIdParam(repo)}/contents/${sanitizeIdParam(path)}`, ['api.github.com']),");

content = content.replace(/fetch\(\`https:\/\/www\.googleapis\.com\/drive\/v3\/files\/\$\{targetId\}\?alt=media\`,/g, "fetch(createSafeUrl(`https://www.googleapis.com/drive/v3/files/${sanitizeIdParam(targetId)}?alt=media`, ['www.googleapis.com']),");

content = content.replace(/const putUrl = targetId \? \`https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/items\/\$\{targetId\}\/content\` : \`https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/\$\{filename\}:\/content\`;/g, 
  "const putUrl = targetId ? `https://graph.microsoft.com/v1.0/me/drive/items/${sanitizeIdParam(targetId)}/content` : `https://graph.microsoft.com/v1.0/me/drive/root:/${filename}:/content`;");
content = content.replace(/fetch\(putUrl,/g, "fetch(createSafeUrl(putUrl, ['graph.microsoft.com']),");

content = content.replace(/const fetchUrl = targetId \? \`https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/items\/\$\{targetId\}\/content\` : \`https:\/\/graph\.microsoft\.com\/v1\.0\/me\/drive\/root:\/\$\{filename\}:\/content\`;/g,
  "const fetchUrl = targetId ? `https://graph.microsoft.com/v1.0/me/drive/items/${sanitizeIdParam(targetId)}/content` : `https://graph.microsoft.com/v1.0/me/drive/root:/${filename}:/content`;");
content = content.replace(/fetch\(fetchUrl,/g, "fetch(createSafeUrl(fetchUrl, ['graph.microsoft.com']),");

content = content.replace(/fetch\(\`\$\{appSettings\.remoteSync\.serverUrl\}\/api\/remote-sync\/receive\`,/g, "fetch(createSafeUrl(`${appSettings.remoteSync.serverUrl}/api/remote-sync/receive`),");
content = content.replace(/fetch\(\`\$\{appSettings\.remoteSync\.serverUrl\}\/api\/remote-sync\/export\`,/g, "fetch(createSafeUrl(`${appSettings.remoteSync.serverUrl}/api/remote-sync/export`),");

content = content.replace(/fetch\(url, \{/g, "fetch(createSafeUrl(url, ['www.googleapis.com']), {");
content = content.replace(/url = \`https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\/\$\{targetId\}\?uploadType=multipart\`;/g, "url = `https://www.googleapis.com/upload/drive/v3/files/${sanitizeIdParam(targetId)}?uploadType=multipart`;");

fs.writeFileSync('server.ts', content);
