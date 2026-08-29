const fs = require('fs');
let code = fs.readFileSync('src/components/LoginView.tsx', 'utf8');

// Replace the main wrapper's bg from bg-[#121212] to just relative, we will add absolute layers
code = code.replace(
  'className="dark min-h-screen relative flex flex-col items-center justify-center p-4 bg-[#121212] text-gray-100"',
  'className="dark min-h-screen relative flex flex-col items-center justify-center p-4 text-gray-100 overflow-hidden"'
);

// Add the background layers before {configureProvider && ...}
const bgLayers = `
      {/* Animated Background Layers */}
      <div className="absolute inset-0 z-0 bg-slide-1 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-slide-2 pointer-events-none"></div>
`;
code = code.replace('{configureProvider && (', bgLayers + '\n      {configureProvider && (');

// Add styles
const newStyles = `
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
          background-image: radial-gradient(circle, #8500be 0.7px, #000000 0.7px);
          background-size: 7px 7px;
          animation: bgDrift2 16s ease-in-out infinite;
        }
`;

code = code.replace(':root {', newStyles + '\n        :root {');

// Update login-card bg
code = code.replace(
  'className="w-full max-w-md bg-white dark:bg-[#0a0a0a] login-card border border-gray-200 dark:border-neutral-900 shadow-2xl overflow-hidden relative z-10"',
  'className="w-full max-w-md bg-[#000000] dark:bg-[#000000] login-card border border-gray-200 dark:border-neutral-900 shadow-2xl overflow-hidden relative z-10"'
);

// Update SVG opacity
code = code.replace(
  'className="absolute -left-10 -bottom-10 opacity-5 dark:opacity-10 pointer-events-none"',
  'className="absolute -left-10 -bottom-10 opacity-40 dark:opacity-60 pointer-events-none"'
);

fs.writeFileSync('src/components/LoginView.tsx', code);
console.log("Patched LoginView.tsx");
