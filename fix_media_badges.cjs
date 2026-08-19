const fs = require('fs');
let code = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');

code = code.replace(/item\.mediaType === 'anime'/g, "item.mediaType.includes('Anime')");

fs.writeFileSync('src/components/SyncMatrixView.tsx', code);
