const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    const gradient = t.isGradient 
      ? \`linear-gradient(\${t.gradientDirection || 'to right'}, \${gradientColors})\`
      : (t.accentColor || '#4f46e5');`;

const repl = `    const gradient = t.isGradient 
      ? (t.gradientDirection === 'circle at center' 
         ? \`radial-gradient(\${t.gradientDirection}, \${gradientColors})\`
         : \`linear-gradient(\${t.gradientDirection || 'to right'}, \${gradientColors})\`)
      : (t.accentColor || '#4f46e5');`;

code = code.replace(target, repl);
fs.writeFileSync('src/App.tsx', code);
