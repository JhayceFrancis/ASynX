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
      if (!res.ok) throw new Error(data.error || 'Failed to get OAuth URL');

      const authWindow = window.open(data.url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) alert('Please allow popups for this site to connect your account.');
    } catch (err: any) {
      setError(err.message);
    }
  };


  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-[#121212]"
    >
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3))',
          backgroundSize: '100% 4px'
        }}
      />
      
      <style>{`
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
          background-image: url("${asynxLoopBg}");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
        }
        .login-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(26, 26, 26, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: -1;
        }
        .login-input:focus {
          border-color: ${theme?.accentColor || '#4f46e5'} !important;
          box-shadow: 0 0 0 1px ${theme?.accentColor || '#4f46e5'} !important;
        }
      `}</style>

      <div className="w-full max-w-md bg-transparent login-card border border-white/10 shadow-2xl overflow-hidden relative z-10">
        <div className="p-8">
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
            {isRegister ? 'Create a local account' : 'Sign in to access your data'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
