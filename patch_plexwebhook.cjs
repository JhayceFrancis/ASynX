const fs = require('fs');
let content = fs.readFileSync('src/components/PlexWebhookView.tsx', 'utf8');

if (!content.includes('PlexLogo')) {
  content = content.replace(
    "import { AppSettings, LibraryItem } from '../types';",
    "import { AppSettings, LibraryItem } from '../types';\nimport { PlexLogo } from './PlatformLogos';"
  );
}

content = content.replace(
  '<Server className="w-4 h-4 text-purple-400" />',
  '<PlexLogo className="w-4 h-4 text-[#E5A00D]" />'
);

content = content.replace(
  '<Tv className="w-5 h-5" />',
  '<PlexLogo className="w-5 h-5" />'
);

fs.writeFileSync('src/components/PlexWebhookView.tsx', content);
