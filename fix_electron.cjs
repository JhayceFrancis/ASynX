const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.build.files = pkg.build.files.filter(f => !f.includes('ASynX-split'));
pkg.build.asarUnpack = pkg.build.asarUnpack ? pkg.build.asarUnpack.filter(f => !f.includes('ASynX-split')) : [];

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
