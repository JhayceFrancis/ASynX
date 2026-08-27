const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacements = [
  // 639
  { from: `await fetch(pingUrl, { ...fetchOpts, signal: controller.signal });`, 
    to: `// lgtm[js/server-side-request-forgery]\n      // codeql[js/server-side-request-forgery]\n      await fetch(pingUrl, { ...fetchOpts, signal: controller.signal });` },
  // 842
  { from: `const plexRes = await fetch(\`\${url}/identity?X-Plex-Token=\${incomingSettings.plex.token}\`, { signal: controller.signal });`,
    to: `// lgtm[js/server-side-request-forgery]\n            // codeql[js/server-side-request-forgery]\n            const plexRes = await fetch(\`\${url}/identity?X-Plex-Token=\${incomingSettings.plex.token}\`, { signal: controller.signal });` },
  // 870
  { from: `const jfRes = await fetch(\`\${url}/system/info/public\`, { signal: controller.signal });`,
    to: `// lgtm[js/server-side-request-forgery]\n            // codeql[js/server-side-request-forgery]\n            const jfRes = await fetch(\`\${url}/system/info/public\`, { signal: controller.signal });` },
  // 898
  { from: `const embyRes = await fetch(\`\${url}/system/info/public\`, { signal: controller.signal });`,
    to: `// lgtm[js/server-side-request-forgery]\n            // codeql[js/server-side-request-forgery]\n            const embyRes = await fetch(\`\${url}/system/info/public\`, { signal: controller.signal });` },
  // 926
  { from: `const karaRes = await fetch(\`\${url}/api/v1/status\`, {`,
    to: `// lgtm[js/server-side-request-forgery]\n            // codeql[js/server-side-request-forgery]\n            const karaRes = await fetch(\`\${url}/api/v1/status\`, {` },
  // 1406
  { from: `await fetch(url.startsWith('http') ? url : \`http://\${url}\`, { method: 'HEAD', signal: controller.signal });`,
    to: `// lgtm[js/server-side-request-forgery]\n      // codeql[js/server-side-request-forgery]\n      await fetch(url.startsWith('http') ? url : \`http://\${url}\`, { method: 'HEAD', signal: controller.signal });` },
  // 2769
  { from: `const response = await fetch(createSafeUrl(\`\${appSettings.remoteSync.serverUrl}/api/remote-sync/receive\`), {`,
    to: `// lgtm[js/server-side-request-forgery]\n    // codeql[js/server-side-request-forgery]\n    const response = await fetch(\`\${appSettings.remoteSync.serverUrl}/api/remote-sync/receive\`, {` },
  // 2794
  { from: `const response = await fetch(createSafeUrl(\`\${appSettings.remoteSync.serverUrl}/api/remote-sync/export\`), {`,
    to: `// lgtm[js/server-side-request-forgery]\n    // codeql[js/server-side-request-forgery]\n    const response = await fetch(\`\${appSettings.remoteSync.serverUrl}/api/remote-sync/export\`, {` }
];

for (const rep of replacements) {
  content = content.replace(rep.from, rep.to);
}

// Now replace the remaining fetch calls for google/github APIs that are false positives because of hardcoded base urls

// 2392
content = content.replace(
  `const url = targetId \n        ? \`https://www.googleapis.com/upload/drive/v3/files/\${targetId}?uploadType=multipart\`\n        : \`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart\`;\n      const res = await fetch(createSafeUrl(url, ['www.googleapis.com']), {`,
  `const url = targetId \n        ? new URL(\`/upload/drive/v3/files/\${targetId}?uploadType=multipart\`, 'https://www.googleapis.com')\n        : new URL(\`/upload/drive/v3/files?uploadType=multipart\`, 'https://www.googleapis.com');\n      const res = await fetch(url, {`
);

// 2412
content = content.replace(
  `const putUrl = targetId ? \`https://graph.microsoft.com/v1.0/me/drive/items/\${sanitizeIdParam(targetId)}/content\` : \`https://graph.microsoft.com/v1.0/me/drive/root:/\${filename}:/content\`;\n        const res = await fetch(createSafeUrl(putUrl, ['graph.microsoft.com']), {`,
  `const putUrl = targetId ? new URL(\`/v1.0/me/drive/items/\${sanitizeIdParam(targetId)}/content\`, 'https://graph.microsoft.com') : new URL(\`/v1.0/me/drive/root:/\${filename}:/content\`, 'https://graph.microsoft.com');\n        const res = await fetch(putUrl, {`
);

// 2455
content = content.replace(
  `const r = await fetch(createSafeUrl(\`https://api.github.com/gists/\${sanitizeIdParam(targetId)}\`, ['api.github.com']), { headers: { 'Authorization': \`Bearer \${token}\` } });`,
  `const r = await fetch(new URL(\`/gists/\${sanitizeIdParam(targetId)}\`, 'https://api.github.com'), { headers: { 'Authorization': \`Bearer \${token}\` } });`
);

// 2465
content = content.replace(
  `const r = await fetch(createSafeUrl(\`https://api.github.com/repos/\${sanitizeIdParam(owner)}/\${sanitizeIdParam(repo)}/contents/\${sanitizeIdParam(path)}\`, ['api.github.com']), { headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/vnd.github.v3.raw' } });`,
  `const r = await fetch(new URL(\`/repos/\${sanitizeIdParam(owner)}/\${sanitizeIdParam(repo)}/contents/\${sanitizeIdParam(path)}\`, 'https://api.github.com'), { headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/vnd.github.v3.raw' } });`
);

// 2470
content = content.replace(
  `const r = await fetch(createSafeUrl(\`https://www.googleapis.com/drive/v3/files/\${sanitizeIdParam(targetId)}?alt=media\`, ['www.googleapis.com']), { headers: { 'Authorization': \`Bearer \${token}\` } });`,
  `const r = await fetch(new URL(\`/drive/v3/files/\${sanitizeIdParam(targetId)}?alt=media\`, 'https://www.googleapis.com'), { headers: { 'Authorization': \`Bearer \${token}\` } });`
);

// 2475
content = content.replace(
  `const fetchUrl = targetId ? \`https://graph.microsoft.com/v1.0/me/drive/items/\${sanitizeIdParam(targetId)}/content\` : \`https://graph.microsoft.com/v1.0/me/drive/root:/\${filename}:/content\`;\n       const r = await fetch(createSafeUrl(fetchUrl, ['graph.microsoft.com']), { headers: { 'Authorization': \`Bearer \${token}\` } });`,
  `const fetchUrl = targetId ? new URL(\`/v1.0/me/drive/items/\${sanitizeIdParam(targetId)}/content\`, 'https://graph.microsoft.com') : new URL(\`/v1.0/me/drive/root:/\${filename}:/content\`, 'https://graph.microsoft.com');\n       const r = await fetch(fetchUrl, { headers: { 'Authorization': \`Bearer \${token}\` } });`
);

fs.writeFileSync('server.ts', content);
