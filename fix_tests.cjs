const fs = require('fs');
let backend = fs.readFileSync('tests/backend/settings.integration.test.ts', 'utf8');
backend = backend.replace(/\\\\\\`/g, '\`').replace(/\\\\\$/g, '$');
fs.writeFileSync('tests/backend/settings.integration.test.ts', backend);

let frontend = fs.readFileSync('tests/frontend/SettingsView.test.tsx', 'utf8');
frontend = frontend.replace("import '@testing-library/jest-dom';", "");
fs.writeFileSync('tests/frontend/SettingsView.test.tsx', frontend);
