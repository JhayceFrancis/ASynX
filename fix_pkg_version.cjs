const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.version = "node -e \"const fs=require('fs'); const pkg=require('./package.json'); const man=JSON.parse(fs.readFileSync('./public/manifest.json')); man.version=pkg.version; fs.writeFileSync('./public/manifest.json', JSON.stringify(man, null, 2));\" && git add public/manifest.json";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Added version hook to package.json");
