const fs = require('fs');
let code = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');

// The original line: mediaType: (obj.type || obj.mediatype || 'anime').toLowerCase(),
// We want to map it to a proper known mediaType
const fixMediaTypeParser = `
                mediaType: ((val) => {
                  if (val.includes('movie') || val.includes('film')) return 'Anime Film';
                  if (val.includes('special')) return 'Anime Special';
                  if (val.includes('drama')) return 'Drama';
                  if (val.includes('tv')) return 'Anime TV Series';
                  return 'Anime TV Series';
                })((obj.type || obj.mediatype || 'Anime TV Series').toLowerCase()),
`;

code = code.replace(/mediaType: \(obj.type \|\| obj.mediatype \|\| 'anime'\)\.toLowerCase\(\),/g, fixMediaTypeParser);

const fixHTMLParser = `
              const typeRaw = (obj.type || obj.format || 'Anime TV Series').toLowerCase();
              const type = typeRaw.includes('movie') || typeRaw.includes('film') ? 'Anime Film' 
                         : typeRaw.includes('special') ? 'Anime Special'
                         : typeRaw.includes('drama') ? 'Drama'
                         : 'Anime TV Series';
`;

code = code.replace(/const type = \(obj.type \|\| obj.format \|\| 'anime'\)\.toLowerCase\(\);/, fixHTMLParser);

fs.writeFileSync('src/components/SyncMatrixView.tsx', code);
