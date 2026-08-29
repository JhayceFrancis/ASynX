const fs = require('fs');
const glob = require('glob');
const path = require('path');

const apiFetchCode = `
let csrfToken: string | null = null;
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!csrfToken) {
       try {
         const res = await window.fetch('/api/csrf-token');
         const data = await res.json();
         if (data.csrfToken) csrfToken = data.csrfToken;
       } catch (e) {}
    }
    if (csrfToken) {
       init = init || {};
       const headers = new Headers(init.headers || {});
       headers.set('x-csrf-token', csrfToken);
       init.headers = headers;
    }
  }
  return window.fetch(input, init);
}
`;

fs.writeFileSync('src/apiFetch.ts', apiFetchCode);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
         results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
for (const file of files) {
  if (file === 'src/apiFetch.ts') continue;
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('fetch(')) {
     // Compute relative path
     const relativePath = path.relative(path.dirname(file), 'src/apiFetch');
     let importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
     if (!importPath.startsWith('.')) importPath = './' + importPath;
     
     // add import at top
     const importStmt = `import { apiFetch as fetch } from '${importPath}';\n`;
     if (code.includes("import ")) {
       code = code.replace(/import /, importStmt + "import ");
     } else {
       code = importStmt + code;
     }
     
     // We replace fetch( with fetch( globally? No, we aliased apiFetch as fetch!
     // So we just need to inject the import!
     fs.writeFileSync(file, code);
  }
}
console.log("Patched all fetches");
