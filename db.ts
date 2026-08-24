import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataDir = process.env.DATA_DIR || process.cwd();
const DB_FILE = path.join(dataDir, 'asynx_data.enc');
const KEY_FILE = path.join(dataDir, '.db_key');
const ALGORITHM = 'aes-256-gcm';

export interface DbLogger {
  info: (cat: string, msg: string) => void;
  warn: (cat: string, msg: string) => void;
  error: (cat: string, msg: string) => void;
  maintenance: (cat: string, msg: string) => void;
}

let logger: DbLogger | null = null;

export function setDbLogger(customLogger: DbLogger) {
  logger = customLogger;
}

function logMaintenance(msg: string) {
  if (logger) logger.maintenance('Database', msg);
  else console.log(`[Database] [MAINTENANCE] ${msg}`);
}

function logError(msg: string, err?: any) {
  const errMsg = err ? `${msg} ${err instanceof Error ? err.message : String(err)}` : msg;
  if (logger) logger.error('Database', errMsg);
  else console.error(`[Database] ${errMsg}`);
}

function logWarn(msg: string) {
  if (logger) logger.warn('Database', msg);
  else console.warn(`[Database] ${msg}`);
}

// Ensure the production persistence directory exists (UK English: Initialisation)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

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
  logMaintenance('Performing initial integrity check...');
  logMaintenance(`Verifying write permissions for storage directory: ${dataDir}`);
  try {
    fs.accessSync(dataDir, fs.constants.W_OK);
    logMaintenance('Storage directory write permissions verified successfully.');
  } catch (err) {
    logError('Storage directory write permission denied. Database mounting may fail.');
  }
  
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const decrypted = decryptData(data);
      logMaintenance('Cryptographic integrity check passed.');
      return decrypted;
    } catch (err) {
      logError("Failed to decrypt DB (Cryptographic integrity check failed or file corrupted):", err);
      logMaintenance("Cryptographic integrity check failed.");
      
      // --- Database Maintenance & Recovery ---
      try {
        const bakDir = path.join(dataDir, '.bak');
        if (!fs.existsSync(bakDir)) {
          fs.mkdirSync(bakDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const corruptedFilePath = path.join(bakDir, `asynx_data.corrupted.${timestamp}.bak`);
        
        // Isolate the damaged file
        fs.renameSync(DB_FILE, corruptedFilePath);
        logMaintenance(`Corrupted database isolated to: ${corruptedFilePath}`);
        logMaintenance("Initiating fresh database recovery process...");
      } catch (backupErr) {
        logError("Failed to isolate corrupted database:", backupErr);
      }
      
      saveDb(defaultData);
      return defaultData;
    }
  } else {
    logMaintenance('No existing database found. Provisioning fresh store.');
    saveDb(defaultData);
    return defaultData;
  }
}

export function saveDb(data: any): void {
  try {
    const encryptedStr = encryptData(data);
    fs.writeFileSync(DB_FILE, encryptedStr, 'utf8');
  } catch (err) {
    logError("Failed to write database file:", err);
    throw new Error("Failed to persist to storage backend.");
  }
}
