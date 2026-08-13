import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataDir = process.env.DATA_DIR || process.cwd();
const DB_FILE = path.join(dataDir, 'asynx_data.enc');
const KEY_FILE = path.join(dataDir, '.db_key');
const ALGORITHM = 'aes-256-gcm';

export function getOrCreateEncryptionKey(): Buffer {
  if (fs.existsSync(KEY_FILE)) {
    return fs.readFileSync(KEY_FILE);
  }
  const key = crypto.randomBytes(32);
  fs.writeFileSync(KEY_FILE, key, { mode: 0o600 });
  return key;
}

export function encryptData(data: any): string {
  const key = getOrCreateEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return JSON.stringify({
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag
  });
}

export function decryptData(encryptedStr: string): any {
  const key = getOrCreateEncryptionKey();
  const parsed = JSON.parse(encryptedStr);
  const iv = Buffer.from(parsed.iv, 'hex');
  const authTag = Buffer.from(parsed.authTag, 'hex');
  const encryptedData = parsed.encryptedData;

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

export function loadDb(defaultData: any): any {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return decryptData(data);
    } catch (err) {
      console.error("Failed to decrypt DB, using default data.", err);
      return defaultData;
    }
  } else {
    saveDb(defaultData);
    return defaultData;
  }
}

export function saveDb(data: any): void {
  const encryptedStr = encryptData(data);
  fs.writeFileSync(DB_FILE, encryptedStr, 'utf8');
}
