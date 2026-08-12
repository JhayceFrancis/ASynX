const fs = require('fs');
const path = require('path');

const mappings = {
  'bg-slate-950': 'bg-gray-50 dark:bg-black',
  'bg-slate-900': 'bg-white dark:bg-[#0a0a0a]',
  'bg-slate-800': 'bg-gray-100 dark:bg-[#111]',
  'bg-slate-700': 'bg-gray-200 dark:bg-[#1a1a1a]',
  'border-slate-800': 'border-gray-200 dark:border-neutral-900',
  'border-slate-700': 'border-gray-300 dark:border-neutral-800',
  'text-slate-100': 'text-gray-900 dark:text-gray-100',
  'text-slate-200': 'text-gray-800 dark:text-gray-200',
  'text-slate-300': 'text-gray-700 dark:text-gray-300',
  'text-slate-400': 'text-gray-600 dark:text-gray-400',
  'text-slate-500': 'text-gray-500 dark:text-gray-500',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [key, value] of Object.entries(mappings)) {
        // Regex with boundaries to prevent double replacements
        const regex = new RegExp(`(?<!dark:)\\b${key}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, value);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
