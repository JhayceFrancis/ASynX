const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.build.files.push("main/**/*");
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Added main/**/* to package.json build files");
