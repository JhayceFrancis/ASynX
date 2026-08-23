const fs = require('fs');
let content = fs.readFileSync('src/components/PlexWebhookView.tsx', 'utf8');

if (!content.includes('PlexLogo')) {
  content = content.replace(
    "import { WebhookLog, AppSettings, LibraryItem, HealthCheckStatus } from '../types';",
    "import { WebhookLog, AppSettings, LibraryItem, HealthCheckStatus } from '../types';\nimport { PlexLogo } from './PlatformLogos';"
  );
} else if (!content.includes("import { PlexLogo }")) {
  content = content.replace(
    "import { WebhookLog, AppSettings, LibraryItem, HealthCheckStatus } from '../types';",
    "import { WebhookLog, AppSettings, LibraryItem, HealthCheckStatus } from '../types';\nimport { PlexLogo } from './PlatformLogos';"
  );
}

fs.writeFileSync('src/components/PlexWebhookView.tsx', content);
