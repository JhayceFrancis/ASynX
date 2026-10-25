import { apiFetch as fetch } from '../apiFetch';
import React, { useState, useEffect } from 'react';
import { Shield, Key, Save, CheckCircle, Link as LinkIcon, Server, User, Globe, Activity, CheckCircle2 } from 'lucide-react';
import { OAuthScopeSelector } from './OAuthScopeSelector';

type ProviderGroup = 'oauth' | 'anime' | 'media';

interface ProviderConfigDef {
  group: ProviderGroup;
  label: string;
  fields: string[];
}

const PROVIDER_CONFIGS: Record<string, ProviderConfigDef> = {
  github: { group: 'oauth', label: 'GitHub', fields: ['clientId', 'clientSecret'] },
  google: { group: 'oauth', label: 'Google', fields: ['clientId', 'clientSecret'] },
  microsoft: { group: 'oauth', label: 'Microsoft', fields: ['clientId', 'clientSecret'] },
  simkl: { group: 'anime', label: 'Simkl', fields: ['clientId', 'clientSecret', 'redirectUri', 'token', 'username', 'scopes'] },
  mal: { group: 'anime', label: 'MyAnimeList', fields: ['clientId', 'clientSecret', 'redirectUri', 'token', 'username', 'scopes'] },
  anilist: { group: 'anime', label: 'AniList', fields: ['clientId', 'clientSecret', 'redirectUri', 'token', 'username', 'scopes'] },
  karakeep: { group: 'anime', label: 'KaraKeep', fields: ['apiUrl', 'token', 'username', 'webhookUrl'] },
  plex: { group: 'media', label: 'Plex', fields: ['serverUri', 'token', 'username', 'clientIdentifier', 'serverName', 'webhookUrl'] },
  jellyfin: { group: 'media', label: 'Jellyfin', fields: ['serverUri', 'token', 'username', 'userId', 'serverName', 'webhookUrl'] },
  emby: { group: 'media', label: 'Emby', fields: ['serverUri', 'token', 'username', 'userId', 'serverName', 'webhookUrl'] },
  tautulli: { group: 'media', label: 'Tautulli', fields: ['serverUri', 'token', 'username', 'secretKey', 'webhookUrl'] }
};

export function SecureCredentialManager() {
  const [provider, setProvider] = useState('simkl');
  const [creds, setCreds] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; request?: any; response?: any; error?: string } | null>(null);

  // Load existing credentials when provider changes
  useEffect(() => {
    let isCancelled = false;
    const loadCreds = async () => {
      try {
        const res = await fetch(`/api/account/oauth/${provider}/config`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data && typeof data === 'object') {
            setCreds(data);
          }
        }
      } catch (e) {
        console.error('Failed to load credentials for', provider, e);
      }
    };
    loadCreds();
    setStatus('idle');
    setMessage('');
    setTestResult(null);
    return () => { isCancelled = true; };
  }, [provider]);

  const handleSave = async () => {
    const config = PROVIDER_CONFIGS[provider];
    if (!config) return;

    // Check if at least one meaningful credential or scope is provided
    const hasValues = config.fields.some(f => {
      const val = creds[f];
      if (Array.isArray(val)) return val.length > 0;
      return typeof val === 'string' && val.trim().length > 0;
    });
    if (!hasValues) {
      setStatus('error');
      setMessage('Please enter at least one credential parameter or select scopes before saving.');
      return;
    }
    
    setStatus('saving');
    try {
      const payload: Record<string, any> = {};
      for (const field of config.fields) {
        if (creds[field] !== undefined && creds[field] !== null) {
          if (field === 'scopes') {
            payload[field] = Array.isArray(creds[field])
              ? creds[field]
              : String(creds[field]).split(',').map((s: string) => s.trim()).filter(Boolean);
          } else if (typeof creds[field] === 'string') {
            payload[field] = creds[field].trim();
          } else {
            payload[field] = creds[field];
          }
        }
      }

      const res = await fetch(`/api/account/oauth/${provider}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save credentials');
      
      setStatus('success');
      setMessage(`${config.label} credentials encrypted & stored successfully.`);
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3500);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to store credentials.');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          config: {
            clientId: creds.clientId,
            clientSecret: creds.clientSecret,
            accessToken: creds.token,
            token: creds.token,
            apiKey: creds.token,
            secretKey: creds.secretKey || creds.token,
            apiUrl: creds.apiUrl,
            serverUrl: creds.serverUri,
            username: creds.username,
            userId: creds.userId,
            clientIdentifier: creds.clientIdentifier,
            serverName: creds.serverName,
            webhookUrl: creds.webhookUrl
          }
        })
      });
      const data = await res.json();
      setTestResult({
        success: !!data.success,
        latencyMs: data.latencyMs,
        request: data.request,
        response: data.response || data.error,
        error: data.error
      });

      if (data.success) {
        // Automatically ensure non-OAuth credentials are securely stored upon successful handshake
        const noOAuth = ['karakeep', 'plex', 'jellyfin', 'emby', 'tautulli'].includes(provider);
        if (noOAuth) {
          try {
            await fetch(`/api/account/oauth/${provider}/config`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(creds)
            });
            setStatus('success');
            setMessage(`${config.label} handshake verified and credentials securely stored.`);
            setTimeout(() => {
              setStatus('idle');
              setMessage('');
            }, 3500);
          } catch (saveErr) {
            console.warn('[SecureCredentialManager] Auto-save error:', saveErr);
          }
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Network request failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const config = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.simkl;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl overflow-hidden shadow-sm mt-6">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-900 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Secure Credential Manager</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Locally encrypted in SQLite with AES-256-GCM authenticated cipher</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testing}
          className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl font-bold flex items-center transition disabled:opacity-50"
        >
          {testing ? (
            <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-1.5" />
          ) : (
            <Activity className="w-3.5 h-3.5 mr-1.5" />
          )}
          Test Handshake
        </button>
      </div>

      <div className="p-6">
        {testResult && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs ${testResult.success ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200' : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200'}`}>
            <div className="flex items-center justify-between font-bold mb-2">
              <span className="flex items-center">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> : <Shield className="w-4 h-4 mr-1 text-rose-500" />}
                {testResult.success ? `Handshake Verified (${testResult.latencyMs}ms)` : 'Handshake Failed'}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">{provider}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="font-semibold block mb-1 uppercase text-gray-500 dark:text-gray-400">Request Spec</span>
                <pre className="bg-white/80 dark:bg-black/60 p-2 rounded-xl border border-black/5 dark:border-white/5 overflow-x-auto font-mono text-gray-700 dark:text-gray-300 custom-scrollbar">{JSON.stringify(testResult.request || { provider }, null, 2)}</pre>
              </div>
              <div>
                <span className="font-semibold block mb-1 uppercase text-gray-500 dark:text-gray-400">Response Payload</span>
                <pre className="bg-white/80 dark:bg-black/60 p-2 rounded-xl border border-black/5 dark:border-white/5 overflow-x-auto font-mono text-gray-700 dark:text-gray-300 custom-scrollbar">{JSON.stringify(testResult.response || testResult.error, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Integration</label>
            <select 
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <optgroup label="Anime & Scrobble Trackers">
                {Object.entries(PROVIDER_CONFIGS).filter(([, v]) => v.group === 'anime').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </optgroup>
              <optgroup label="Media Servers & Scrobblers">
                {Object.entries(PROVIDER_CONFIGS).filter(([, v]) => v.group === 'media').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </optgroup>
              <optgroup label="Core Identity & OAuth">
                {Object.entries(PROVIDER_CONFIGS).filter(([, v]) => v.group === 'oauth').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.fields.includes('clientId') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client ID</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.clientId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, clientId: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('clientSecret') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client Secret</label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="password"
                    value={creds.clientSecret ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, clientSecret: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('token') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Token / API Key</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="password"
                    value={creds.token ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, token: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('secretKey') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Secret Key / Salt</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="password"
                    value={creds.secretKey ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, secretKey: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('username') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.username ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, username: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('userId') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">User Identifier (User ID)</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.userId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, userId: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('serverName') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Server Name</label>
                <div className="relative">
                  <Server className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.serverName ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, serverName: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('clientIdentifier') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client Machine ID</label>
                <div className="relative">
                  <Server className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.clientIdentifier ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, clientIdentifier: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('serverUri') && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Server URI / Host URL</label>
                <div className="relative">
                  <Server className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.serverUri ?? creds.serverUrl ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, serverUri: val, serverUrl: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('apiUrl') && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">API Base URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.apiUrl ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, apiUrl: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('redirectUri') && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">OAuth 2.0 Redirect URI</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.redirectUri ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, redirectUri: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('webhookUrl') && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Inbound Webhook Endpoint</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={creds.webhookUrl ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreds(prev => ({ ...prev, webhookUrl: val }));
                    }}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {config.fields.includes('scopes') && (provider === 'simkl' || provider === 'mal' || provider === 'anilist') && (
              <div className="sm:col-span-2 pt-2">
                <OAuthScopeSelector
                  provider={provider as 'simkl' | 'mal' | 'anilist'}
                  selectedScopes={Array.isArray(creds.scopes) ? creds.scopes : (typeof creds.scopes === 'string' ? creds.scopes.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined)}
                  onChange={(scopes) => {
                    setCreds(prev => ({ ...prev, scopes }));
                  }}
                />
              </div>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-center font-medium ${status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {status === 'success' && <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />}
              {message}
            </div>
          )}
          
          <div className="pt-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {status === 'saving' ? 'Encrypting & Saving...' : 'Save To Secure Vault'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
