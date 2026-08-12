const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const backupType = `  automatedBackups?: {
    enabled: boolean;
    provider: 'github_gist' | 'github_repo' | 'gdrive' | 'onedrive';
    frequency: 'daily' | 'weekly' | 'monthly';
    token: string;
    targetId: string;
    lastBackup?: string;
  };
  syncRules: {`;

content = content.replace('  syncRules: {', backupType);
fs.writeFileSync('src/types.ts', content);
