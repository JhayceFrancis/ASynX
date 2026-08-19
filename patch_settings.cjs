const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const regex = /\{\/\* Section 0: Theme & Appearance \*\/\}[\s\S]*?(?=\{\/\* Section 1: Simkl API Config \*\/\})/g;

const replacement = `      {/* Section 0: Theme & Appearance */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm mb-6">
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-neutral-900 pb-3">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Theme & UI Customization</h3>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Accent Text Color</label>
              <input
                type="color"
                value={formState.theme?.accentColor || '#4f46e5'}
                onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, accentColor: e.target.value } }))}
                className="w-full h-10 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Header Background</label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="color"
                  value={formState.theme?.headerColor || '#1a1a1a'}
                  onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, headerColor: e.target.value } }))}
                  className="w-full h-10 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Main Content Padding</label>
              <select
                value={formState.theme?.paddingSize || '1.5rem'}
                onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, paddingSize: e.target.value } }))}
                className="w-full mt-1 p-2 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-neutral-800 text-sm focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="0.5rem">Compact (0.5rem)</option>
                <option value="1rem">Cozy (1rem)</option>
                <option value="1.5rem">Standard (1.5rem)</option>
                <option value="2rem">Spacious (2rem)</option>
                <option value="3rem">Ultra Wide (3rem)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-neutral-900/50 pt-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Buttons & Highlights</h4>
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formState.theme?.isGradient || false}
                  onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, isGradient: e.target.checked } }))}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span>Enable Gradient Backgrounds</span>
              </label>
            </div>

            {!formState.theme?.isGradient ? (
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Solid Button Color</label>
                <input
                  type="color"
                  value={formState.theme?.buttonColor || '#4f46e5'}
                  onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, buttonColor: e.target.value } }))}
                  className="w-full h-10 mt-1 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800 max-w-[200px]"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Gradient Direction</label>
                    <select
                      value={formState.theme?.gradientDirection || 'to right'}
                      onChange={(e) => setFormState(prev => ({ ...prev, theme: { ...prev.theme, gradientDirection: e.target.value } }))}
                      className="w-full mt-1 p-2 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-neutral-800 text-sm focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="to right">To Right</option>
                      <option value="to left">To Left</option>
                      <option value="to bottom">To Bottom</option>
                      <option value="to top">To Top</option>
                      <option value="to bottom right">To Bottom Right</option>
                      <option value="45deg">45 Degrees</option>
                      <option value="135deg">135 Degrees</option>
                      <option value="circle at center">Radial (Center)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Gradient Colors Palette</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {(formState.theme?.gradientColors || ['#4f46e5', '#ec4899']).map((color, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...(formState.theme?.gradientColors || ['#4f46e5', '#ec4899'])];
                            newColors[index] = e.target.value;
                            setFormState(prev => ({ ...prev, theme: { ...prev.theme, gradientColors: newColors } }));
                          }}
                          className="w-10 h-10 cursor-pointer bg-transparent rounded border border-gray-200 dark:border-neutral-800"
                        />
                        {(formState.theme?.gradientColors?.length || 2) > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newColors = [...(formState.theme?.gradientColors || ['#4f46e5', '#ec4899'])];
                              newColors.splice(index, 1);
                              setFormState(prev => ({ ...prev, theme: { ...prev.theme, gradientColors: newColors } }));
                            }}
                            className="p-1 text-gray-400 hover:text-rose-500 transition"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newColors = [...(formState.theme?.gradientColors || ['#4f46e5', '#ec4899']), '#ffffff'];
                        setFormState(prev => ({ ...prev, theme: { ...prev.theme, gradientColors: newColors } }));
                      }}
                      className="h-10 px-3 rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111] transition flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      <span>Add Color</span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 h-8 rounded-lg w-full border border-gray-200 dark:border-neutral-800" 
                  style={{
                    background: (formState.theme?.gradientDirection && (formState.theme?.gradientDirection === 'circle at center')) 
                      ? \`radial-gradient(circle at center, \${(formState.theme?.gradientColors || ['#4f46e5', '#ec4899']).join(', ')})\`
                      : \`linear-gradient(\${formState.theme?.gradientDirection || 'to right'}, \${(formState.theme?.gradientColors || ['#4f46e5', '#ec4899']).join(', ')})\`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/SettingsView.tsx', code);
