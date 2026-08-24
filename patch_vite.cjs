const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

// Replace the entire server block carefully, keeping HMR and watch untouched, but adding port and proxy
const serverBlockStart = content.indexOf('server: {');
const serverBlockEnd = content.indexOf('},', serverBlockStart + 'server: {'.length) + 2; // naive approach, better to just use regex or AST, but since I know the exact content:

if (serverBlockStart !== -1) {
  const newServerBlock = `server: {
      port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 4000,
      proxy: {
        '/api': {
          target: \`http://localhost:\${process.env.PORT || 4001}\`,
          changeOrigin: true,
          secure: false,
        }
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },`;

  content = content.replace(/server:\s*{[\s\S]*?},/, newServerBlock);
  fs.writeFileSync('vite.config.ts', content);
}
