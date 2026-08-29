import { apiFetch as fetch } from '../apiFetch';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { UserCircle, Shield, Upload, Save, Lock, Layout, Link2, Share2, LogIn } from 'lucide-react';
import { SecureCredentialManager } from './SecureCredentialManager';

export default function AccountView() {
  const { user, login } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gdprConsent, setGdprConsent] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, avatarUrl, bannerUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      
      login(data.user);
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    try {
      const res = await fetch(`/api/account/oauth/${provider}/url`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get OAuth URL');
      const authWindow = window.open(data.url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) alert('Please allow popups for this site to connect your account.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-text">
      {/* Banner & Avatar Preview */}
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
        <div 
          className="h-48 w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative"
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
        </div>
        <div className="px-8 pb-8 relative">
          <div className="-mt-12 mb-4 flex justify-between items-end">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-[#111] flex items-center justify-center overflow-hidden shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayName || username}</h2>
            <p className="text-gray-500 dark:text-gray-400">@{username}</p>
          </div>
        </div>
      </div>

      {(message || error) && (
        <div className={`p-4 rounded-xl text-sm font-medium ${error ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'}`}>
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center">
            <Layout className="w-5 h-5 text-indigo-500 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Bind an email to link IDP"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Avatar URL</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... or click Upload"
                    className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-gray-100 rounded-xl transition-colors font-medium text-sm flex items-center">
                    <Upload className="w-4 h-4" />
                  </button>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setAvatarUrl)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Banner URL</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://... or click Upload"
                    className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button type="button" onClick={() => bannerInputRef.current?.click()} className="px-4 py-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-gray-100 rounded-xl transition-colors font-medium text-sm flex items-center">
                    <Upload className="w-4 h-4" />
                  </button>
                  <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setBannerUrl)} />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center">
            <Shield className="w-5 h-5 text-indigo-500 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Security</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !currentPassword || !newPassword}
                className="w-full mt-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Identity Providers */}
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center">
          <Share2 className="w-5 h-5 text-indigo-500 mr-2" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Identity Providers (IDP)</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Connect external accounts for easier sign-in.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">GitHub</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.oauthProvider === 'github' ? 'Connected as primary account' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOAuth('github')}
                disabled={user?.oauthProvider === 'github'}
                className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {user?.oauthProvider === 'github' ? 'Connected' : 'Connect'}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1 border border-gray-200 dark:border-transparent">
                  <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24" className="text-blue-500">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Google</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.oauthProvider === 'google' ? 'Connected as primary account' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOAuth('google')}
                disabled={user?.oauthProvider === 'google'}
                className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {user?.oauthProvider === 'google' ? 'Connected' : 'Connect'}
              </button>
            </div>
          </div>
          <SecureCredentialManager />

        </div>
      </div>

    </div>
  );
}
