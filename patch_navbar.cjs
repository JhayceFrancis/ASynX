const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const brandOld = `<h1 className="text-3xl font-extrabold tracking-tight flex items-baseline">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">ASyn</span>
                  <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-br from-rose-500 to-orange-500 dark:from-rose-400 dark:to-orange-400 font-black italic -ml-0.5 font-serif drop-shadow-sm">X</span>
                </h1>`;

const brandNew = `                <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
                  <span style={
                    settings?.theme?.isGradient && settings.theme.gradientColors?.length >= 2 
                      ? { backgroundImage: \`linear-gradient(to right, \${settings.theme.gradientColors[0]}, \${settings.theme.gradientColors[1]})\`, WebkitBackgroundClip: 'text', color: 'transparent' }
                      : { color: settings?.theme?.accentColor || '#4f46e5' }
                  }>ASyn</span>
                  <span 
                    className="text-5xl font-black italic -ml-0.5 font-serif drop-shadow-sm translate-y-1" 
                    style={{ 
                      backgroundImage: settings?.theme?.isGradient && settings.theme.gradientColors?.length >= 2 
                        ? \`linear-gradient(to bottom right, \${settings.theme.gradientColors[1]}, \${settings.theme.gradientColors[0]})\`
                        : 'linear-gradient(to bottom right, #f43f5e, #f97316)',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}
                  >X</span>
                </h1>`;

content = content.replace(brandOld, brandNew);

fs.writeFileSync('src/components/Navbar.tsx', content);
