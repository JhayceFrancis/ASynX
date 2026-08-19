const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const scrollbarCSS = `
        /* Discreet Custom Scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
          background: transparent;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 10px;
          transition: background-color 0.2s;
        }
        *:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.4);
        }
        .dark *:hover::-webkit-scrollbar-thumb {
          background-color: rgba(82, 82, 82, 0.6);
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.8) !important;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(115, 115, 115, 0.9) !important;
        }
`;

code = code.replace(
  /\/\* App Layout Overrides \*\//,
  `${scrollbarCSS}\n        /* App Layout Overrides */`
);

fs.writeFileSync('src/App.tsx', code);
