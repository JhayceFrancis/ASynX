const fs = require('fs');
const file = 'src/components/QuickCustomizePanel.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Header Background
const headerBgRegex = /\{\/\* Header Background \*\/\}.*?\{\/\* Button \/ Icon Color \*\/\}/s;
const newHeaderBg = `{/* Header Background */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Layout className="w-3 h-3" />
                <span>Heading BG (Solid or Gradient)</span>
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!t.headerIsGradient}
                    onChange={() => updateTheme({ headerIsGradient: false })}
                    className="accent-indigo-500"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Solid:</span>
                  <input
                    type="color"
                    value={t.headerColor === 'transparent' ? '#ffffff' : (t.headerColor || '#000000')}
                    onChange={(e) => updateTheme({ headerColor: e.target.value, headerIsGradient: false })}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <button
                    onClick={() => updateTheme({ headerColor: 'transparent', headerIsGradient: false })}
                    className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-neutral-700"
                  >Clear</button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={t.headerIsGradient}
                    onChange={() => updateTheme({ headerIsGradient: true, headerGradientColors: t.headerGradientColors || ['#ff9a9e', '#fecfef'] })}
                    className="accent-indigo-500"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Gradient:</span>
                  <input
                    type="color"
                    value={t.headerGradientColors?.[0] || '#ff9a9e'}
                    onChange={(e) => updateTheme({ headerIsGradient: true, headerGradientColors: [e.target.value, t.headerGradientColors?.[1] || '#fecfef'] })}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs text-gray-500">to</span>
                  <input
                    type="color"
                    value={t.headerGradientColors?.[1] || '#fecfef'}
                    onChange={(e) => updateTheme({ headerIsGradient: true, headerGradientColors: [t.headerGradientColors?.[0] || '#ff9a9e', e.target.value] })}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                </div>
              </div>
            </div>

            {/* Button / Icon Color */}`;
content = content.replace(headerBgRegex, newHeaderBg);

// 2. Button / Icon Color
const buttonColorRegex = /\{\/\* Button \/ Icon Color \*\/\}.*?\{\/\* Button Text Color \*\/\}/s;
const newButtonColor = `{/* Button / Icon Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Button & Icon Color</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={t.buttonColor || '#4f46e5'}
                  onChange={(e) => updateTheme({ buttonColor: e.target.value, iconColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <button
                  onClick={() => updateTheme({ buttonColor: '', iconColor: 'currentColor' })}
                  className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-neutral-700"
                >Default</button>
              </div>
            </div>

            {/* Button Text Color */}`;
content = content.replace(buttonColorRegex, newButtonColor);

// 3. Button Text Color
const buttonTextColorRegex = /\{\/\* Button Text Color \*\/\}.*?\{\/\* Base Theme Colors \*\/\}/s;
const newButtonTextColor = `{/* Button Text Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Type className="w-3 h-3" />
                <span>Button Text Color</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={t.buttonTextColor || '#ffffff'}
                  onChange={(e) => updateTheme({ buttonTextColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
            </div>

            {/* Base Theme Colors */}`;
content = content.replace(buttonTextColorRegex, newButtonTextColor);

// 4. Base Theme Colors (Base Accent)
const baseAccentRegex = /\{\/\* Base Theme Colors \*\/\}.*?\{\/\* View Mode \(Grid\/List\/Block\) \*\/\}/s;
const newBaseAccent = `{/* Base Theme Colors */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Base Accent</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={t.accentColor || '#4f46e5'}
                  onChange={(e) => updateTheme({ accentColor: e.target.value, isGradient: false })}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
            </div>

            {/* View Mode (Grid/List/Block) */}`;
content = content.replace(baseAccentRegex, newBaseAccent);

// 5. Subheader Color
const subheaderRegex = /\{\/\* Subheader Color \*\/\}.*?\{\/\* App Background Gradient \*\/\}/s;
const newSubheader = `{/* Subheader Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Subheader Color</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={t.subheaderColor === 'transparent' || !t.subheaderColor ? '#ffffff' : (t.subheaderColor.startsWith('#') ? t.subheaderColor : '#ffffff')}
                  onChange={(e) => updateTheme({ subheaderColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <button
                  onClick={() => updateTheme({ subheaderColor: 'transparent' })}
                  className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-neutral-700"
                >Clear</button>
              </div>
            </div>

            {/* App Background Gradient */}`;
content = content.replace(subheaderRegex, newSubheader);


// 6. App Background Gradient
const bgGradientRegex = /\{\/\* App Background Gradient \*\/\}.*?\{\/\* Layout Density \*\/\}/s;
const newBgGradient = `{/* App Background Gradient */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Background Gradient</span>
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Gradient:</span>
                  <input
                    type="color"
                    value={t.appBgGradStart || '#f3f4f6'}
                    onChange={(e) => {
                      const start = e.target.value;
                      const end = t.appBgGradEnd || '#e5e7eb';
                      updateTheme({ 
                        appBgGradStart: start, 
                        appBackgroundGradient: \`linear-gradient(\${t.gradientDirection || 'to bottom right'}, \${start}, \${end})\` 
                      });
                    }}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs text-gray-500">to</span>
                  <input
                    type="color"
                    value={t.appBgGradEnd || '#e5e7eb'}
                    onChange={(e) => {
                      const start = t.appBgGradStart || '#f3f4f6';
                      const end = e.target.value;
                      updateTheme({ 
                        appBgGradEnd: end, 
                        appBackgroundGradient: \`linear-gradient(\${t.gradientDirection || 'to bottom right'}, \${start}, \${end})\` 
                      });
                    }}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                </div>
                <button
                  onClick={() => updateTheme({ appBackgroundGradient: '', appBgGradStart: '', appBgGradEnd: '' })}
                  className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-neutral-700"
                >Clear</button>
              </div>
            </div>

            {/* Layout Density */}`;
content = content.replace(bgGradientRegex, newBgGradient);

fs.writeFileSync(file, content);
console.log("Customization patched");
