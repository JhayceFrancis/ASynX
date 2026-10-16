const fs = require('node:fs');
const path = require('node:path');

const version = process.env.VERSION || require('../package.json').version;
const baseDir = path.resolve(__dirname, '..');
const sourceDir = path.join(baseDir, 'dist-extension-raw');
const chromiumDir = path.join(baseDir, 'dist-extension', 'chromium');
const safariDir = path.join(baseDir, 'dist-extension', 'safari');

// Helper to recursively copy build assets
function copyFolderSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const element of fs.readdirSync(from)) {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  }
}

// Read base manifest.json
const manifestPath = path.join(sourceDir, 'manifest.json');
const baseManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
baseManifest.version = version;

// Ensure localhost:14000 host permission is always present
const hostPerms = new Set(baseManifest.host_permissions || []);
hostPerms.add('http://localhost:14000/*');
hostPerms.add('http://127.0.0.1:14000/*');
baseManifest.host_permissions = Array.from(hostPerms);

// 1. Build Chromium Target (Chrome & Edge)
copyFolderSync(sourceDir, chromiumDir);
const chromiumManifest = {
  ...baseManifest,
  minimum_chrome_version: '116'
};
// Remove Safari-only keys so Chrome/Edge don't throw "Unrecognised manifest key" warnings
delete chromiumManifest.browser_specific_settings;

fs.writeFileSync(
  path.join(chromiumDir, 'manifest.json'),
  JSON.stringify(chromiumManifest, null, 2) + '\n'
);

// 2. Build Safari Target (WebKit)
copyFolderSync(sourceDir, safariDir);
const safariManifest = {
  ...baseManifest,
  browser_specific_settings: {
    safari: {
      strict_min_version: '16.4'
    }
  }
};

fs.writeFileSync(
  path.join(safariDir, 'manifest.json'),
  JSON.stringify(safariManifest, null, 2) + '\n'
);

console.log(`[Manifest Builder] Optimised manifests generated for Chromium (Chrome/Edge) and Safari v${version}`);
