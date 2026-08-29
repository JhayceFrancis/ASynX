import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { getOrCreateEncryptionKey } from './db.js';

const dataDir = process.env.DATA_DIR || process.cwd();
const OAUTH_DB_FILE = path.join(dataDir, 'oauth_credentials.sqlite');
const ALGORITHM = 'aes-256-gcm';

export function encryptString(text: string): string {
  const key = getOrCreateEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return JSON.stringify({
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag
  });
}

export function decryptString(encryptedStr: string): string {
  try {
    const parsed = JSON.parse(encryptedStr);
    if (!parsed.iv || !parsed.encryptedData || !parsed.authTag) return encryptedStr;
    const key = getOrCreateEncryptionKey();
    const iv = Buffer.from(parsed.iv, 'hex');
    const authTag = Buffer.from(parsed.authTag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(parsed.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return encryptedStr;
  }
}

let db: Database.Database;

function initDb() {
  if (!db) {
    db = new Database(OAUTH_DB_FILE);
    db.exec(`
      CREATE TABLE IF NOT EXISTS oauth_credentials (
        provider TEXT PRIMARY KEY,
        clientId TEXT,
        clientSecret TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}

export function getOAuthCredentials(provider: string) {
  initDb();
  const row = db.prepare('SELECT clientId, clientSecret FROM oauth_credentials WHERE provider = ?').get(provider) as { clientId: string, clientSecret: string } | undefined;
  if (!row) return null;
  return {
    clientId: decryptString(row.clientId),
    clientSecret: decryptString(row.clientSecret)
  };
}

export function saveOAuthCredentials(provider: string, clientId: string, clientSecret: string) {
  initDb();
  const encryptedId = encryptString(clientId);
  const encryptedSecret = encryptString(clientSecret);
  db.prepare(`
    INSERT INTO oauth_credentials (provider, clientId, clientSecret, updatedAt)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(provider) DO UPDATE SET 
      clientId = excluded.clientId,
      clientSecret = excluded.clientSecret,
      updatedAt = excluded.updatedAt
  `).run(provider, encryptedId, encryptedSecret);
}
