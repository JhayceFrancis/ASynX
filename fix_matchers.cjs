const fs = require('fs');
let frontend = fs.readFileSync('tests/frontend/SettingsView.test.tsx', 'utf8');

frontend = frontend.replace("import matchers from '@testing-library/jest-dom/matchers';\\nexpect.extend(matchers);\\n", "");
frontend = frontend.replace(/expect\\(screen\\.getByTestId\\('error-banner'\\)\\)\\.toBeInTheDocument\\(\\);/g, "expect(screen.getByTestId('error-banner')).toBeTruthy();");
frontend = frontend.replace(/expect\\(screen\\.queryByTestId\\('error-banner'\\)\\)\\.not\\.toBeInTheDocument\\(\\);/g, "expect(screen.queryByTestId('error-banner')).toBeNull();");

fs.writeFileSync('tests/frontend/SettingsView.test.tsx', frontend);
