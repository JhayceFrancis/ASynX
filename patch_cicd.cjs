const fs = require('fs');
let cicd = fs.readFileSync('.github/workflows/ci-cd.yml', 'utf8');
cicd = cicd.replace(
  'git add package.json package-lock.json',
  'git add package.json package-lock.json public/manifest.json'
);
fs.writeFileSync('.github/workflows/ci-cd.yml', cicd);
console.log("Patched ci-cd.yml");
