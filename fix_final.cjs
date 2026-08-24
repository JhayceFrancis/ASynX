const fs = require('fs');

let frontend = fs.readFileSync('tests/frontend/SettingsView.test.tsx', 'utf8');
// Fix Jest-DOM bindings for vitest by adding import and cleanup
frontend = frontend.replace(
  "import { describe, it, expect, vi } from 'vitest';",
  "import { describe, it, expect, vi, afterEach } from 'vitest';\nimport { cleanup } from '@testing-library/react';\nimport matchers from '@testing-library/jest-dom/matchers';\nexpect.extend(matchers);\nafterEach(() => { cleanup(); });"
);

fs.writeFileSync('tests/frontend/SettingsView.test.tsx', frontend);
