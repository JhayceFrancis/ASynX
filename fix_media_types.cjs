const fs = require('fs');

let typesCode = fs.readFileSync('src/types.ts', 'utf8');
typesCode = typesCode.replace(/mediaType: .*/, "mediaType: 'Anime TV Series' | 'Anime Film' | 'Film' | 'TV Series' | 'Anime Special' | 'Drama';");
fs.writeFileSync('src/types.ts', typesCode);

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/mediaType: "anime"/g, 'mediaType: "Anime TV Series"');
serverCode = serverCode.replace(/mediaType: "drama"/g, 'mediaType: "Drama"');
serverCode = serverCode.replace(/mediaType: mediaType \|\| "anime"/g, 'mediaType: mediaType || "Anime TV Series"');
serverCode = serverCode.replace(/mediaType === "anime"/g, 'mediaType === "Anime TV Series"');
serverCode = serverCode.replace(/mediaType === "drama"/g, 'mediaType === "Drama"');

fs.writeFileSync('server.ts', serverCode);

