const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// Add imports
if (!content.includes('SimklLogo')) {
  content = content.replace(
    "import { OAuthService } from '../services/OAuthService';",
    "import { OAuthService } from '../services/OAuthService';\nimport { SimklLogo, MalLogo, AniListLogo, PlexLogo, KarakeepLogo } from './PlatformLogos';\nimport { ASynXLogo } from './ASynXLogo';"
  );
}

// Section 1: Simkl
content = content.replace(
  '<span className="w-3 h-3 rounded-full bg-emerald-400" />',
  '<SimklLogo className="w-4 h-4 text-emerald-400" />'
);

// Section 2: MAL
content = content.replace(
  '<span className="w-3 h-3 rounded-full bg-blue-400" />',
  '<MalLogo className="w-4 h-4 text-[#2E51A2] dark:text-blue-400" />'
);

// Section 3: AniList
content = content.replace(
  '<span className="w-3 h-3 rounded-full bg-cyan-400" />',
  '<AniListLogo className="w-4 h-4 text-[#02A9FF] dark:text-cyan-400" />'
);

// Section 4: KaraKeep
content = content.replace(
  '<Database className="w-4 h-4 text-pink-500" />',
  '<KarakeepLogo className="w-4 h-4 text-pink-500" />'
);

// Section 6: Plex / Jellyfin
content = content.replace(
  '<span className="w-3 h-3 rounded-full bg-purple-400" />',
  '<PlexLogo className="w-4 h-4 text-[#E5A00D]" />'
);

fs.writeFileSync('src/components/SettingsView.tsx', content);
