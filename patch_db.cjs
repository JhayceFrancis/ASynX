const fs = require('fs');

let content = fs.readFileSync('db.ts', 'utf8');
content = content.replace(
  "const DB_FILE = path.join(process.cwd(), 'asynx_data.enc');",
  "const dataDir = process.env.DATA_DIR || process.cwd();\nconst DB_FILE = path.join(dataDir, 'asynx_data.enc');"
);
content = content.replace(
  "const KEY_FILE = path.join(process.cwd(), '.db_key');",
  "const KEY_FILE = path.join(dataDir, '.db_key');"
);
fs.writeFileSync('db.ts', content);
