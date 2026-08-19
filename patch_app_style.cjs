const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const buttonStyle = t\.buttonColor \|\| gradient;\n    const headerBg = t\.headerColor \|\| 'transparent';\n    const paddingSz = t\.paddingSize \|\| '1\.5rem';/,
  `const buttonStyle = t.buttonColor || gradient;
    const headerBg = t.headerColor || 'transparent';
    const paddingSz = t.paddingSize || '1.5rem';
    const btnText = t.buttonTextColor || '#ffffff';`
);

code = code.replace(
  /--button-bg: \$\{buttonStyle\};\n          --header-bg: \$\{headerBg\};\n          --app-padding: \$\{paddingSz\};/,
  `--button-bg: \${buttonStyle};
          --button-text: \${btnText};
          --header-bg: \${headerBg};
          --app-padding: \${paddingSz};`
);

code = code.replace(
  /button\.bg-indigo-600, button\.bg-indigo-500, \.bg-indigo-600, \.bg-indigo-500, \.bg-purple-600 \{\n          background: var\(--button-bg\) !important;\n          transition: opacity 0\.2s ease;\n        \}/,
  `button.bg-indigo-600, button.bg-indigo-500, .bg-indigo-600, .bg-indigo-500, .bg-purple-600 {
          background: var(--button-bg) !important;
          color: var(--button-text) !important;
          transition: opacity 0.2s ease;
        }`
);

fs.writeFileSync('src/App.tsx', code);
