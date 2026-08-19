const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\/\* Buttons overriding \*\/[\s\S]*?\/\* Text overriding \*\//;

const replacement = `/* Buttons overriding */
        button.bg-indigo-600, button.bg-indigo-500, .bg-indigo-600, .bg-indigo-500, .bg-purple-600 {
          background: var(--button-bg) !important;
          transition: opacity 0.2s ease;
        }
        button.bg-indigo-600:hover, button.bg-indigo-500:hover, .bg-indigo-600:hover, .bg-indigo-500:hover, .bg-purple-600:hover {
          opacity: 0.9 !important;
        }
        /* Text overriding */`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
