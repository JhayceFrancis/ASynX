const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// We will replace createSafeUrl(...) with new URL(...) for the fixed domains
content = content.replace(
  /createSafeUrl\(`https:\/\/api\.github\.com\/gists\$\{targetId \? '\/' \+ sanitizeIdParam\(targetId\) : ''\}`,\s*\['api\.github\.com'\]\)/g,
  "new URL(`/gists${targetId ? '/' + sanitizeIdParam(targetId) : ''}`, 'https://api.github.com')"
);

content = content.replace(
  /createSafeUrl\(`https:\/\/api\.github\.com\/repos\/\$\{sanitizeIdParam\(owner\)\}\/\$\{sanitizeIdParam\(repo\)\}\/contents\/\$\{sanitizeIdParam\(path\)\}`,\s*\['api\.github\.com'\]\)/g,
  "new URL(`/repos/${sanitizeIdParam(owner)}/${sanitizeIdParam(repo)}/contents/${sanitizeIdParam(path)}`, 'https://api.github.com')"
);

content = content.replace(
  /createSafeUrl\(url,\s*\['www\.googleapis\.com'\]\)/g,
  "new URL(url, 'https://www.googleapis.com')" // Wait, if url is full URL, this doesn't work if url is tainted host.
);

fs.writeFileSync('server.ts', content);
