const fs = require('fs');
let code = fs.readFileSync('src/components/LoginView.tsx', 'utf8');

// 1. Add state variables for focus and transition
code = code.replace(
  'const [configureProvider, setConfigureProvider] = useState<string | null>(null);',
  `const [configureProvider, setConfigureProvider] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);`
);

// 2. Remove "Sign in to access your data"
code = code.replace(
  "{isRegister ? 'Create a local account' : 'Sign in to access your data'}",
  "{isRegister ? 'Create a local account' : '\\u00A0'}"
);

// 3. Update 'Username' label to 'Username or Email'
code = code.replace(
  '<label className="block text-xs font-medium text-gray-400 mb-1">Username</label>',
  '<label className="block text-xs font-medium text-gray-400 mb-1">Username or Email</label>'
);

// 4. Update inputs to handle focus
code = code.replace(
  'onChange={(e) => setUsername(e.target.value)}',
  'onChange={(e) => setUsername(e.target.value)}\n                onFocus={() => setIsFocused(true)}\n                onBlur={() => setIsFocused(false)}'
);

code = code.replace(
  'onChange={(e) => setPassword(e.target.value)}',
  'onChange={(e) => setPassword(e.target.value)}\n                onFocus={() => setIsFocused(true)}\n                onBlur={() => setIsFocused(false)}'
);

// 5. Update handleSubmit to trigger transition
const oldHandleSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
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
  };`;

const newHandleSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsTransitioning(true);
    setLoading(true);
    
    // Allow animation to play before executing request
    setTimeout(async () => {
      try {
        const endpoint = isRegister ? '/api/account/register' : '/api/account/login';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, email: isRegister ? email : undefined })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failed');
        
        // Wait a tiny bit more for the expansion to cover the screen
        setTimeout(() => login(data), 300);
      } catch (err: any) {
        setError(err.message);
        setIsTransitioning(false);
        setLoading(false);
      }
    }, 800);
  };`;

code = code.replace(oldHandleSubmit, newHandleSubmit);

// 6. Update the login-card to remove overflow-hidden conditionally
code = code.replace(
  'className="w-full max-w-md bg-[#000000] dark:bg-[#000000] login-card border border-gray-200 dark:border-neutral-900 shadow-2xl overflow-hidden relative z-10"',
  'className={`w-full max-w-md bg-[#000000] dark:bg-[#000000] login-card border border-gray-200 dark:border-neutral-900 shadow-2xl relative z-10 ${isTransitioning ? \'\' : \'overflow-hidden\'}`}'
);

// 7. Update the SVG wrapper and animations
const oldSvgWrapper = `<div className="absolute -left-10 -bottom-10 opacity-80 dark:opacity-80 pointer-events-none">
          <object data={asynxLoopBg} type="image/svg+xml" style={{ width: 256, height: 256 }} className="text-indigo-500 opacity-50 pointer-events-none" aria-label="ASynX Loop Logo" />
        </div>`;

const newSvgWrapper = `<div className={\`absolute -left-10 -bottom-10 pointer-events-none transition-opacity duration-500 \${isTransitioning ? 'opacity-100 z-50' : 'opacity-80 z-0'}\`}>
          <div className={\`origin-center \${isFocused && !isTransitioning ? 'svg-spin-slow' : ''} \${isTransitioning ? 'svg-spin-fast' : ''}\`}>
            <object data={asynxLoopBg} type="image/svg+xml" style={{ width: 256, height: 256 }} className="text-indigo-500 opacity-50 pointer-events-none" aria-label="ASynX Loop Logo" />
          </div>
        </div>`;

code = code.replace(oldSvgWrapper, newSvgWrapper);

// 8. Add CSS animations to the <style> block
const oldStyleEnd = `        .login-input:focus {
          border-color: \${theme?.accentColor || '#4f46e5'} !important;
          box-shadow: 0 0 0 1px \${theme?.accentColor || '#4f46e5'} !important;
        }
      \`}</style>`;

const newStyleEnd = `        .login-input:focus {
          border-color: \${theme?.accentColor || '#4f46e5'} !important;
          box-shadow: 0 0 0 1px \${theme?.accentColor || '#4f46e5'} !important;
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
      \`}</style>`;

code = code.replace(oldStyleEnd, newStyleEnd);

fs.writeFileSync('src/components/LoginView.tsx', code);
console.log("Patched LoginView for SVG animation");
