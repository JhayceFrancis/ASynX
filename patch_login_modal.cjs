const fs = require('fs');
const file = 'src/components/LoginView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state variables
const stateRegex = /const \[loading, setLoading\] = useState\(false\);\n  const \[theme, setTheme\] = useState<any>\(null\);/;
const newState = `const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<any>(null);
  const [configureProvider, setConfigureProvider] = useState<string | null>(null);
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  const [oauthConfigSaving, setOauthConfigSaving] = useState(false);`;
content = content.replace(stateRegex, newState);

// Update handleOAuth
const handleOauthRegex = /const handleOAuth = async \(provider: string\) => \{[\s\S]*?\}\s*\};\s*return \(/;
const newHandleOauth = `const handleOAuth = async (provider: string) => {
    try {
      const res = await fetch(\`/api/account/oauth/\${provider}/url\`);
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.includes('missing Client ID')) {
          setConfigureProvider(provider);
          return;
        }
        throw new Error(data.error || 'Failed to get OAuth URL');
      }

      const authWindow = window.open(data.url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) alert('Please allow popups for this site to connect your account.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveOAuthConfig = async () => {
    if (!configureProvider || !oauthClientId || !oauthClientSecret) return;
    setOauthConfigSaving(true);
    try {
      const res = await fetch(\`/api/account/oauth/\${configureProvider}/config\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: oauthClientId, clientSecret: oauthClientSecret })
      });
      if (!res.ok) throw new Error('Failed to save configuration');
      
      const p = configureProvider;
      setConfigureProvider(null);
      setOauthClientId('');
      setOauthClientSecret('');
      
      // Retry
      handleOAuth(p);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOauthConfigSaving(false);
    }
  };

  return (`
content = content.replace(handleOauthRegex, newHandleOauth);

// Add Modal in return
const returnRegex = /<div \n      className="dark min-h-screen relative flex flex-col items-center justify-center p-4 bg-\[#121212\] text-gray-100"\n    >/;
const newReturn = `<div 
      className="dark min-h-screen relative flex flex-col items-center justify-center p-4 bg-[#121212] text-gray-100"
    >
      {configureProvider && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-white text-lg font-bold mb-2 capitalize">Configure {configureProvider}</h3>
            <p className="text-xs text-gray-400 mb-5">
              The Client ID and Secret for this provider are missing. Please provide them to enable {configureProvider} login for this instance.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Client ID</label>
                <input
                  type="text"
                  value={oauthClientId}
                  onChange={(e) => setOauthClientId(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Enter Client ID"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Client Secret</label>
                <input
                  type="password"
                  value={oauthClientSecret}
                  onChange={(e) => setOauthClientSecret(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Enter Client Secret"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => { setConfigureProvider(null); setOauthClientId(''); setOauthClientSecret(''); }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                disabled={oauthConfigSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOAuthConfig}
                disabled={!oauthClientId || !oauthClientSecret || oauthConfigSaving}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {oauthConfigSaving ? 'Saving...' : 'Save & Login'}
              </button>
            </div>
          </div>
        </div>
      )}`;
content = content.replace(returnRegex, newReturn);

fs.writeFileSync(file, content);
console.log("LoginView patched with Modal");
