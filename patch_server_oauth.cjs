const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import { getOAuthCredentials, saveOAuthCredentials } from './oauth_storage.js';\n`;
if (!content.includes('oauth_storage.js')) {
    content = content.replace('import { URL } from \'url\';', 'import { URL } from \'url\';\n' + importStatement);
}

const oldOauth = `const getOAuthConfig = (provider: string) => {
  const dbConfig = dbState.oauthConfig?.[provider] || {};
  switch (provider) {
    case 'github':
      return {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userUrl: 'https://api.github.com/user',
        clientId: dbConfig.clientId || process.env.GITHUB_CLIENT_ID,
        clientSecret: dbConfig.clientSecret || process.env.GITHUB_CLIENT_SECRET,
        scope: 'read:user'
      };
    case 'google':
      return {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        clientId: dbConfig.clientId || process.env.GOOGLE_CLIENT_ID,
        clientSecret: dbConfig.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
        scope: 'email profile'
      };
    case 'microsoft':
      return {
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userUrl: 'https://graph.microsoft.com/v1.0/me',
        clientId: dbConfig.clientId || process.env.MICROSOFT_CLIENT_ID,
        clientSecret: dbConfig.clientSecret || process.env.MICROSOFT_CLIENT_SECRET,
        scope: 'User.Read'
      };
    default: return null;
  }
};

  app.post('/api/account/oauth/:provider/config', express.json(), (req, res) => {
    const { provider } = req.params;
    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) return res.status(400).json({ error: 'Missing Client ID or Secret' });
    if (!dbState.oauthConfig) dbState.oauthConfig = {};
    dbState.oauthConfig[provider] = { clientId, clientSecret };
    persistDb();
    res.json({ success: true });
  });`;

const newOauth = `const getOAuthConfig = (provider: string) => {
  let dbConfig = getOAuthCredentials(provider) || {};
  switch (provider) {
    case 'github':
      return {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userUrl: 'https://api.github.com/user',
        clientId: dbConfig.clientId || process.env.GITHUB_CLIENT_ID,
        clientSecret: dbConfig.clientSecret || process.env.GITHUB_CLIENT_SECRET,
        scope: 'read:user'
      };
    case 'google':
      return {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        clientId: dbConfig.clientId || process.env.GOOGLE_CLIENT_ID,
        clientSecret: dbConfig.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
        scope: 'email profile'
      };
    case 'microsoft':
      return {
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userUrl: 'https://graph.microsoft.com/v1.0/me',
        clientId: dbConfig.clientId || process.env.MICROSOFT_CLIENT_ID,
        clientSecret: dbConfig.clientSecret || process.env.MICROSOFT_CLIENT_SECRET,
        scope: 'User.Read'
      };
    default: return null;
  }
};

  app.post('/api/account/oauth/:provider/config', express.json(), (req, res) => {
    const { provider } = req.params;
    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) return res.status(400).json({ error: 'Missing Client ID or Secret' });
    
    saveOAuthCredentials(provider, clientId, clientSecret);
    res.json({ success: true });
  });`;

content = content.replace(oldOauth, newOauth);
fs.writeFileSync(file, content);
console.log("Server patched with SQLite OAuth storage");
