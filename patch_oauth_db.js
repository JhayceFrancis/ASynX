const fs = require('fs');
let code = fs.readFileSync('oauth_storage.ts', 'utf8');

const newInitDb = `function initDb() {
  if (!db) {
    db = new Database(OAUTH_DB_FILE);
    db.exec(\`
      CREATE TABLE IF NOT EXISTS oauth_credentials (
        provider TEXT PRIMARY KEY,
        clientId TEXT,
        clientSecret TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    try { db.exec("ALTER TABLE oauth_credentials ADD COLUMN redirectUri TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE oauth_credentials ADD COLUMN serverUri TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE oauth_credentials ADD COLUMN token TEXT"); } catch (e) {}
  }
}`;

const newGet = `export function getOAuthCredentials(provider: string) {
  initDb();
  const row = db.prepare('SELECT clientId, clientSecret, redirectUri, serverUri, token FROM oauth_credentials WHERE provider = ?').get(provider) as any;
  if (!row) return null;
  return {
    clientId: row.clientId ? decryptString(row.clientId) : undefined,
    clientSecret: row.clientSecret ? decryptString(row.clientSecret) : undefined,
    redirectUri: row.redirectUri ? decryptString(row.redirectUri) : undefined,
    serverUri: row.serverUri ? decryptString(row.serverUri) : undefined,
    token: row.token ? decryptString(row.token) : undefined
  };
}`;

const newSave = `export function saveOAuthCredentials(provider: string, creds: any) {
  initDb();
  const encryptedId = creds.clientId ? encryptString(creds.clientId) : null;
  const encryptedSecret = creds.clientSecret ? encryptString(creds.clientSecret) : null;
  const encryptedRedirect = creds.redirectUri ? encryptString(creds.redirectUri) : null;
  const encryptedServer = creds.serverUri ? encryptString(creds.serverUri) : null;
  const encryptedToken = creds.token ? encryptString(creds.token) : null;
  
  db.prepare(\`
    INSERT INTO oauth_credentials (provider, clientId, clientSecret, redirectUri, serverUri, token, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(provider) DO UPDATE SET 
      clientId = excluded.clientId,
      clientSecret = excluded.clientSecret,
      redirectUri = excluded.redirectUri,
      serverUri = excluded.serverUri,
      token = excluded.token,
      updatedAt = excluded.updatedAt
  \`).run(provider, encryptedId, encryptedSecret, encryptedRedirect, encryptedServer, encryptedToken);
}`;

code = code.replace(/function initDb\(\) \{[\s\S]*?\n\}/, newInitDb);
code = code.replace(/export function getOAuthCredentials.*?\{[\s\S]*?\n\}/, newGet);
code = code.replace(/export function saveOAuthCredentials.*?\{[\s\S]*?\n\}/, newSave);
fs.writeFileSync('oauth_storage.ts', code);
