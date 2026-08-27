const fs = require('fs');
let content = fs.readFileSync('db.ts', 'utf8');

const target = `export function getOrCreateEncryptionKey(): Buffer {
  if (fs.existsSync(KEY_FILE)) {
    return fs.readFileSync(KEY_FILE);
  }
  const key = crypto.randomBytes(32);
  fs.writeFileSync(KEY_FILE, key, { mode: 0o600 });
  return key;
}`;

const replacement = `export function getOrCreateEncryptionKey(): Buffer {
  try {
    return fs.readFileSync(KEY_FILE);
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err;
  }
  const key = crypto.randomBytes(32);
  try {
    fs.writeFileSync(KEY_FILE, key, { mode: 0o600, flag: 'wx' });
  } catch (err: any) {
    if (err.code === 'EEXIST') {
      return fs.readFileSync(KEY_FILE);
    }
    throw err;
  }
  return key;
}`;

content = content.replace(target, replacement);
fs.writeFileSync('db.ts', content);
