const fs = require('fs');
let content = fs.readFileSync('src/components/SystemHealthView.tsx', 'utf8');

if (!content.includes('SimklLogo')) {
  content = content.replace(
    "import { GridLayoutEngine } from './GridLayoutEngine';",
    "import { GridLayoutEngine } from './GridLayoutEngine';\nimport { SimklLogo, MalLogo, AniListLogo, PlexLogo, KarakeepLogo } from './PlatformLogos';"
  );
}

const target = `<Box className="w-4 h-4 text-indigo-500" />`;
const replace = `{key.toLowerCase() === 'simkl' ? <SimklLogo className="w-4 h-4 text-emerald-400" /> : 
                       key.toLowerCase() === 'mal' ? <MalLogo className="w-4 h-4 text-[#2E51A2] dark:text-blue-400" /> : 
                       key.toLowerCase() === 'anilist' ? <AniListLogo className="w-4 h-4 text-[#02A9FF] dark:text-cyan-400" /> :
                       key.toLowerCase() === 'plex' ? <PlexLogo className="w-4 h-4 text-[#E5A00D]" /> :
                       key.toLowerCase() === 'karakeep' ? <KarakeepLogo className="w-4 h-4 text-pink-500" /> :
                       <Box className="w-4 h-4 text-indigo-500" />}`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/SystemHealthView.tsx', content);
