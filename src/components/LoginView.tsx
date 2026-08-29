import { apiFetch as fetch } from '../apiFetch';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Hexagon } from 'lucide-react';
import { LogoBanner } from './LogoBanner';
import { ASynXLogo } from './ASynXLogo';
import asynxLoopBg from './ASynX (loop).svg';

// Let's replace simple-icons with lucide icons to avoid dependency issues.
// We can use generic icons for providers.
const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

export default function LoginView() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState<any>(null);
  const [configureProvider, setConfigureProvider] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  const [oauthConfigSaving, setOauthConfigSaving] = useState(false);

  useEffect(() => {
    fetch('/api/theme')
      .then(r => r.json())
      .then(data => {
        if (data && data.theme) setTheme(data.theme);
      })
      .catch(() => {});
  }, []);

  const gradientColors = theme?.gradientColors && theme.gradientColors.length > 0 
       ? theme.gradientColors.join(', ') 
       : (theme?.gradientStart && theme?.gradientEnd ? `${theme.gradientStart}, ${theme.gradientEnd}` : '#4f46e5, #ec4899');
       
  const gradient = theme?.isGradient 
       ? (theme.gradientDirection === 'circle at center' 
          ? `radial-gradient(${theme.gradientDirection}, ${gradientColors})`
         : `linear-gradient(${theme.gradientDirection || 'to right'}, ${gradientColors})`)
      : (theme?.accentColor || '#4f46e5');

  const buttonStyle = theme?.buttonColor || gradient;
  const btnText = theme?.buttonTextColor || '#ffffff';
  const radius = theme?.borderRadius || '0.75rem';


  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetch('/api/account/me').then(r => r.json()).then(data => {
          if (data && !data.error) {
            login(data);
          }
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/account/register' : '/api/account/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email: isRegister ? email : undefined })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      login(data);
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
      const res = await fetch(`/api/account/oauth/${configureProvider}/config`, {
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

  return (
    <div 
      className="dark min-h-screen relative flex flex-col items-center justify-center p-4 text-gray-100 overflow-hidden"
    >
      
      {/* Animated Background Layers */}
      <div className="absolute inset-0 z-0 bg-slide-1 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-slide-2 pointer-events-none"></div>

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
      )}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3))',
          backgroundSize: '100% 4px'
        }}
      />
      
      <style>{`
        
        @keyframes bgDrift1 {
          0%, 100% { opacity: 1; transform: scale(1) translate(0px, 0px); filter: blur(0px); }
          25% { opacity: 0.8; transform: scale(1.05) translate(-15px, -15px); filter: blur(2px); }
          50% { opacity: 0; transform: scale(1.1) translate(-30px, -30px); filter: blur(6px); }
          75% { opacity: 0.8; transform: scale(1.05) translate(-15px, -15px); filter: blur(2px); }
        }
        @keyframes bgDrift2 {
          0%, 100% { opacity: 0; transform: scale(1.1) translate(30px, 30px); filter: blur(6px); }
          25% { opacity: 0.8; transform: scale(1.05) translate(15px, 15px); filter: blur(2px); }
          50% { opacity: 1; transform: scale(1) translate(0px, 0px); filter: blur(0px); }
          75% { opacity: 0.8; transform: scale(1.05) translate(15px, 15px); filter: blur(2px); }
        }
        .bg-slide-1 {
          background-color: #1c2130;
          background-image: radial-gradient(circle, #028f76 0.84px, transparent 0.84px);
          background-size: 10.5px 10.5px;
          animation: bgDrift1 16s ease-in-out infinite;
        }
        .bg-slide-2 {
          background-color: #000000;
          background-image: radial-gradient(#8500be 0.7000000000000001px, #000000 0.7000000000000001px);
          background-size: 7px 7px;
          animation: bgDrift2 16s ease-in-out infinite;
        }

        :root {
          --login-btn-bg: ${buttonStyle};
          --login-btn-text: ${btnText};
          --login-radius: ${radius};
        }
        .login-btn {
          background: var(--login-btn-bg) !important;
          color: var(--login-btn-text) !important;
          border-radius: var(--login-radius) !important;
        }
        .login-card {
          border-radius: var(--login-radius) !important;
          background-color: var(--card-bg, #0a0a0a);
          position: relative;
        }
        .login-input:focus {
          border-color: ${theme?.accentColor || '#4f46e5'} !important;
          box-shadow: 0 0 0 1px ${theme?.accentColor || '#4f46e5'} !important;
        }
        @keyframes svgSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes svgSpinFastExpand {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          100% { transform: translate(150px, -200px) scale(30) rotate(1080deg); opacity: 1; }
        }
        .svg-spin-slow {
          animation: svgSpinSlow 15s linear infinite;
        }
        .svg-spin-fast {
          animation: svgSpinFastExpand 1.5s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }
      `}</style>

      <div className={`w-full max-w-md bg-[#000000] dark:bg-[#000000] login-card border border-gray-200 dark:border-neutral-900 shadow-2xl relative z-10 ${isTransitioning ? '' : 'overflow-hidden'}`}>
        <div className={`absolute -left-10 -bottom-10 pointer-events-none transition-opacity duration-500 ${isTransitioning ? 'opacity-100 z-50' : 'opacity-80 z-0'}`}>
          <div className={`origin-center ${isFocused && !isTransitioning ? 'svg-spin-slow' : ''} ${isTransitioning ? 'svg-spin-fast' : ''}`}>
            <object data={asynxLoopBg} type="image/svg+xml" style={{ width: 256, height: 256 }} className="text-indigo-500 opacity-50 pointer-events-none" aria-label="ASynX Loop Logo" />
          </div>
        </div>
        <div className="p-8 relative z-10">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <ASynXLogo size={64} isSyncing={loading} />
            <LogoBanner
              gradientColors={theme?.gradientColors}
              accentColor={theme?.accentColor}
              isScrolled={true}
              isSyncing={loading}
            />
          </div>
          
          <p className="text-sm text-gray-400 text-center mb-8">
            {isRegister ? 'Create a local account' : '\u00A0'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Username or Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-all login-input"
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-all login-input"
                  placeholder="name@example.com"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-all login-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full login-btn font-medium text-sm py-2.5 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-4 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">

            <button
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20" className="text-gray-300"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </button>
            <button
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="Google"
            >
              <GoogleIcon />
            </button>
            <button
              onClick={() => handleOAuth('microsoft')}
              className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="Microsoft"
            >
              <MicrosoftIcon />
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
