const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Update persistDb
const persistDbRegex = /function persistDb\(\) \{([\s\S]*?)saveDb\(\{([\s\S]*?)\}\);\n\}/;
const persistDbMatch = content.match(persistDbRegex);
if (persistDbMatch) {
  const inner = persistDbMatch[2];
  if (!inner.includes('users:')) {
    const newInner = inner.replace('extensionState', 'extensionState,\n    users: dbState.users || [],\n    oauthConfig: dbState.oauthConfig || {}');
    content = content.replace(persistDbRegex, `function persistDb() {${persistDbMatch[1]}saveDb({${newInner}});\n}`);
  }
}

// 2. Replace OAUTH_PROVIDERS
const oauthProvidersRegex = /const OAUTH_PROVIDERS: Record<string, any> = \{[\s\S]*?^\s*\};\n/m;
const newOauthProviders = `const getOAuthConfig = (provider: string) => {
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
};\n\n  app.post('/api/account/oauth/:provider/config', express.json(), (req, res) => {
    const { provider } = req.params;
    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) return res.status(400).json({ error: 'Missing Client ID or Secret' });
    if (!dbState.oauthConfig) dbState.oauthConfig = {};
    dbState.oauthConfig[provider] = { clientId, clientSecret };
    persistDb();
    res.json({ success: true });
  });\n`;
content = content.replace(oauthProvidersRegex, newOauthProviders);

// 3. Replace usage in endpoints
content = content.replace(/const config = OAUTH_PROVIDERS\[provider\];/g, 'const config = getOAuthConfig(provider);');

fs.writeFileSync(file, content);
console.log("OAuth backend patched");
