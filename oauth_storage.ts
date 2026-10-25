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
    try { db.exec("ALTER TABLE oauth_credentials ADD COLUMN redirectUri TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE oauth_credentials ADD COLUMN serverUri TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE oauth_credentials ADD COLUMN token TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE oauth_credentials ADD COLUMN configJson TEXT"); } catch (e) {}
  }
}

export function getOAuthCredentials(provider: string): Record<string, any> | null {
  initDb();
  const row = db.prepare('SELECT clientId, clientSecret, redirectUri, serverUri, token, configJson FROM oauth_credentials WHERE provider = ?').get(provider) as any;
  if (!row) return null;
  let fullConfig: Record<string, any> = {};
  if (row.configJson) {
    try {
      const decrypted = decryptString(row.configJson);
      fullConfig = JSON.parse(decrypted);
    } catch (e) {}
  }
  return {
    ...fullConfig,
    clientId: row.clientId ? decryptString(row.clientId) : (fullConfig.clientId || undefined),
    clientSecret: row.clientSecret ? decryptString(row.clientSecret) : (fullConfig.clientSecret || undefined),
    redirectUri: row.redirectUri ? decryptString(row.redirectUri) : (fullConfig.redirectUri || undefined),
    serverUri: row.serverUri ? decryptString(row.serverUri) : (fullConfig.serverUri || fullConfig.serverUrl || undefined),
    serverUrl: row.serverUri ? decryptString(row.serverUri) : (fullConfig.serverUrl || fullConfig.serverUri || undefined),
    token: row.token ? decryptString(row.token) : (fullConfig.token || fullConfig.apiKey || fullConfig.accessToken || fullConfig.secretKey || undefined)
  };
}

export function saveOAuthCredentials(provider: string, creds: any) {
  initDb();
  const encryptedId = creds.clientId ? encryptString(creds.clientId) : null;
  const encryptedSecret = creds.clientSecret ? encryptString(creds.clientSecret) : null;
  const encryptedRedirect = creds.redirectUri ? encryptString(creds.redirectUri) : null;
  const encryptedServer = (creds.serverUri || creds.serverUrl) ? encryptString(creds.serverUri || creds.serverUrl) : null;
  const encryptedToken = (creds.token || creds.apiKey || creds.accessToken || creds.secretKey) ? encryptString(creds.token || creds.apiKey || creds.accessToken || creds.secretKey) : null;
  const encryptedConfig = encryptString(JSON.stringify(creds));
  
  db.prepare(`
    INSERT INTO oauth_credentials (provider, clientId, clientSecret, redirectUri, serverUri, token, configJson, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(provider) DO UPDATE SET 
      clientId = excluded.clientId,
      clientSecret = excluded.clientSecret,
      redirectUri = excluded.redirectUri,
      serverUri = excluded.serverUri,
      token = excluded.token,
      configJson = excluded.configJson,
      updatedAt = excluded.updatedAt
  `).run(provider, encryptedId, encryptedSecret, encryptedRedirect, encryptedServer, encryptedToken, encryptedConfig);
}
