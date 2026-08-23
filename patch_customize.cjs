const fs = require('fs');
let code = fs.readFileSync('src/components/QuickCustomizePanel.tsx', 'utf8');

const newConfig = `
            {/* Subheader Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Subheader Color</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: '', label: 'Default' },
                  { value: 'rgba(255, 255, 255, 0.95)', label: 'Light' },
                  { value: 'rgba(10, 10, 10, 0.95)', label: 'Dark' },
                  { value: 'rgba(79, 70, 229, 0.1)', label: 'Indigo' },
                  { value: 'rgba(236, 72, 153, 0.1)', label: 'Pink' },
                  { value: 'transparent', label: 'Transparent' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateTheme({ subheaderColor: option.value })}
                    className={\`px-2 py-1 text-[10px] rounded border transition \${t.subheaderColor === option.value || (!t.subheaderColor && option.value === '') ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-neutral-700'}\`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* App Background Gradient */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Background Gradient</span>
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'None (Default)' },
                  { value: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)', label: 'Light Gray (Light Mode)' },
                  { value: 'linear-gradient(to bottom, #0a0a0a, #171717)', label: 'Dark Gray (Dark Mode)' },
                  { value: 'linear-gradient(to bottom right, rgba(79,70,229,0.1), rgba(236,72,153,0.1))', label: 'Indigo to Pink' },
                  { value: 'linear-gradient(to bottom right, rgba(16,185,129,0.1), rgba(59,130,246,0.1))', label: 'Emerald to Blue' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateTheme({ appBackgroundGradient: option.value })}
                    className={\`px-2 py-1.5 text-xs text-left rounded border transition \${t.appBackgroundGradient === option.value || (!t.appBackgroundGradient && option.value === '') ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-neutral-700'}\`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
`;

code = code.replace('</select>\n            </div>', '</select>\n            </div>\n' + newConfig);

fs.writeFileSync('src/components/QuickCustomizePanel.tsx', code);
