import { apiFetch as fetch } from '../apiFetch';
import React, { useState } from 'react';
import { Shield, Key, Save, CheckCircle } from 'lucide-react';

export function SecureCredentialManager() {
  const [provider, setProvider] = useState('github');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setStatus('error');
      setMessage('Both Client ID and Client Secret are required.');
      return;
    }
    
    // Validate formatting (alphanumeric/special characters generally used in credentials)
    if (clientId.length < 5 || clientSecret.length < 5) {
      setStatus('error');
      setMessage('Credentials seem too short. Please verify them.');
      return;
    }

    setStatus('saving');
    try {
      const res = await fetch(`/api/account/oauth/${provider}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save credentials');
      
      setStatus('success');
      setMessage(`${provider} credentials stored securely.`);
      setClientId('');
      setClientSecret('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm mt-8">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center">
        <Shield className="w-5 h-5 text-indigo-500 mr-2" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Secure Credential Manager</h3>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Locally provision custom OAuth Application credentials. These are securely encrypted in the local SQLite database via AES-256-GCM.
        </p>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">OAuth Provider</label>
            <select 
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="github">GitHub</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Client ID</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Paste Client ID..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Client Secret</label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Paste Client Secret..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm flex items-center ${status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {status === 'success' && <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />}
              {message}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {status === 'saving' ? 'Encrypting & Saving...' : 'Store Securely'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
