const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// 1. Add import
if (!code.includes('SecureCredentialManager')) {
  code = code.replace(/import \{ PreImportModal \} from '\.\/PreImportModal';/, "import { PreImportModal } from './PreImportModal';\nimport { SecureCredentialManager } from './SecureCredentialManager';");
}

// 2. Add state
if (!code.includes('activeSettingsTab')) {
  code = code.replace(/const \[webhookTestResults, setWebhookTestResults\] = useState<Record<string, any>>\(\{\}\);/, "const [webhookTestResults, setWebhookTestResults] = useState<Record<string, any>>({});\n  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'credentials'>('general');");
}

// 3. Add tabs UI and conditionally render
const tabsUI = `      </div>

      <div className="flex border-b border-gray-200 dark:border-neutral-800 mb-6 space-x-4">
        <button
          type="button"
          onClick={() => setActiveSettingsTab('general')}
          className={\`py-2 px-4 font-semibold text-sm border-b-2 transition-colors \${activeSettingsTab === 'general' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}\`}
        >
          General Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveSettingsTab('credentials')}
          className={\`py-2 px-4 font-semibold text-sm border-b-2 transition-colors \${activeSettingsTab === 'credentials' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}\`}
        >
          Secure Credentials
        </button>
      </div>
      
      {activeSettingsTab === 'credentials' && (
        <div className="space-y-6">
          <SecureCredentialManager />
        </div>
      )}

      <div className={activeSettingsTab === 'general' ? 'space-y-6 block' : 'hidden'}>
`;

code = code.replace(/<\/div>\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-6">/, tabsUI + '\n            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">');

// 4. Close the div at the end of the form
code = code.replace(/<\/form>/, "      </div>\n    </form>");

fs.writeFileSync('src/components/SettingsView.tsx', code);
