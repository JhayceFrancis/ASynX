const fs = require('fs');

let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const regex = /\{\!formState\.theme\?\.isGradient \? \(\s*<div>\s*<label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Solid Button Color<\/label>\s*<input\s*type="color"\s*value=\{formState\.theme\?\.buttonColor \|\| '#4f46e5'\}\s*onChange=\{\(e\) => setFormState\(prev => \(\{ \.\.\.prev, theme: \{ \.\.\.prev\.theme, buttonColor: e\.target\.value \} \}\)\)\}\s*className="w-full h-10 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800 max-w-\[200px\]"\s*\/>\s*<\/div>\s*\) : \(/;

const newHTML = `{!formState.theme?.isGradient ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Solid Button Color</label>
                  <input
                    type="color"
                    value={formState.theme?.buttonColor || '#4f46e5'}
                    onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, buttonColor: e.target.value } }))}
                    className="w-full h-10 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Button Text Color</label>
                  <input
                    type="color"
                    value={formState.theme?.buttonTextColor || '#ffffff'}
                    onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, buttonTextColor: e.target.value } }))}
                    className="w-full h-10 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
                  />
                </div>
              </div>
            ) : (`;

code = code.replace(regex, newHTML);

const gradientRegex = /<div className="mt-3 h-8 rounded-lg w-full border border-gray-200 dark:border-neutral-800" \s*style=\{\{\s*background: \(formState\.theme\?\.gradientDirection && \(formState\.theme\?\.gradientDirection === 'circle at center'\)\) \s*\? \\\`radial-gradient\(circle at center, \\\$\{\(formState\.theme\?\.gradientColors \|\| \['#4f46e5', '#ec4899'\]\)\.join\(', '\)\}\)\\\`\s*: \\\`linear-gradient\(\\\$\{formState\.theme\?\.gradientDirection \|\| 'to right'\}, \\\$\{\(formState\.theme\?\.gradientColors \|\| \['#4f46e5', '#ec4899'\]\)\.join\(', '\)\}\)\\\`\s*\}\}\s*\/>\s*<\/div>\s*\)\}/;

const newGradientHTML = `<div className="flex items-center space-x-4 mt-3">
                  <div className="h-8 flex-1 rounded-lg border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-xs font-bold shadow-sm" 
                    style={{
                      background: (formState.theme?.gradientDirection && (formState.theme?.gradientDirection === 'circle at center')) 
                        ? \`radial-gradient(circle at center, \${(formState.theme?.gradientColors || ['#4f46e5', '#ec4899']).join(', ')})\`
                        : \`linear-gradient(\${formState.theme?.gradientDirection || 'to right'}, \${(formState.theme?.gradientColors || ['#4f46e5', '#ec4899']).join(', ')})\`,
                      color: formState.theme?.buttonTextColor || '#ffffff'
                    }}
                  >
                    Preview
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Text Color</label>
                    <input
                      type="color"
                      value={formState.theme?.buttonTextColor || '#ffffff'}
                      onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, buttonTextColor: e.target.value } }))}
                      className="w-full h-6 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
                    />
                  </div>
                </div>
              </div>
            )}`;

code = code.replace(gradientRegex, newGradientHTML);

fs.writeFileSync('src/components/SettingsView.tsx', code);
