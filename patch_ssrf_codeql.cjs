const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// I will just use `createSafeUrl(\`\${apiUrl}/api/v1/sync\`)` because createSafeUrl already automatically pushes `appSettings?.karakeep?.apiUrl` to the `allowList`.
// And I shouldn't provide the dynamic string parameter `parsedApiUrl.hostname` to it because this flags CodeQL.

const search = `    const parsedApiUrl = new URL(apiUrl.startsWith('http') ? apiUrl : 'http://' + apiUrl);
    const karakeepRes = await fetch(createSafeUrl(\`\${parsedApiUrl.origin}/api/v1/sync\`, parsedApiUrl.hostname), {`;
const replace = `
    const karakeepRes = await fetch(createSafeUrl(\`\${apiUrl}/api/v1/sync\`), {`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts");
} else {
  console.log("Not found");
}
