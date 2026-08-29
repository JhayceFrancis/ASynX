const fs = require('fs');
const glob = require('glob'); // Not using glob since we can just specify them.

const files = [
  'src/components/ExtensionCompanionView.tsx',
  'src/components/ApiDocumentationView.tsx',
  'src/components/PlexWebhookView.tsx',
  'src/components/SecureCredentialManager.tsx',
  'src/components/SettingsView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    // For React components using VITE_PORT
    code = code.replace(/localhost:3000/g, 'localhost:${import.meta.env.VITE_PORT || 3000}');
    code = code.replace(/:3000/g, ':${import.meta.env.VITE_PORT || 3000}');
    // However, some places might not be in template literals. 
    // e.g. setBackendUrl('http://localhost:3000') -> setBackendUrl(`http://localhost:${import.meta.env.VITE_PORT || 3000}`)
    code = code.replace(/'http:\/\/localhost:\$\{import\.meta\.env\.VITE_PORT \|\| 3000\}'/g, '`http://localhost:${import.meta.env.VITE_PORT || 3000}`');
    code = code.replace(/"http:\/\/localhost:\$\{import\.meta\.env\.VITE_PORT \|\| 3000\}"/g, '`http://localhost:${import.meta.env.VITE_PORT || 3000}`');
    
    // For ApiDocumentationView
    code = code.replace(/"3000:3000"/g, '`${import.meta.env.VITE_PORT || 3000}:${import.meta.env.VITE_PORT || 3000}`');
    
    fs.writeFileSync(file, code);
  }
});
console.log("Patched frontend components");
