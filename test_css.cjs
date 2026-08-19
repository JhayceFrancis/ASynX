const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /\/\* Text overriding \*\/\n        \.text-indigo-500, \.text-indigo-600, \.text-purple-500, \.text-purple-600 \{\n          color: var\(--accent-base\) !important;\n        \}/,
  `/* Text overriding */
        .text-indigo-500:not(:hover), .text-indigo-600:not(:hover), .text-purple-500:not(:hover), .text-purple-600:not(:hover) {
          color: var(--accent-base) !important;
        }
        /* Fix for explicit tailwind hover utilities */
        .hover\\:text-white:hover { color: #ffffff !important; }
        .group:hover .group-hover\\:text-white { color: #ffffff !important; }
        .hover\\:text-gray-800:hover { color: #1f2937 !important; }
        .dark .dark\\:hover\\:text-gray-200:hover { color: #e5e7eb !important; }`
);

fs.writeFileSync('src/App.tsx', code);
