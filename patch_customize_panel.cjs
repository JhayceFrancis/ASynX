const fs = require('fs');

let content = fs.readFileSync('src/components/QuickCustomizePanel.tsx', 'utf8');

const additionalFields = `
            {/* Global Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Type className="w-3 h-3" />
                <span>Global Font Family</span>
              </label>
              <select
                value={t.fontFamily || 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'}
                onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
              >
                <option value='ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'>System UI / Sans</option>
                <option value='Inter, "Inter Variable", sans-serif'>Inter</option>
                <option value='"Plus Jakarta Sans", sans-serif'>Plus Jakarta Sans</option>
                <option value='"Fira Code", "JetBrains Mono", monospace'>Monospace</option>
                <option value='"Playfair Display", serif'>Serif (Elegant)</option>
              </select>
            </div>

            {/* Base Border Radius */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Box className="w-3 h-3" />
                <span>Base Border Radius</span>
              </label>
              <select
                value={t.borderRadius || '0.75rem'}
                onChange={(e) => updateTheme({ borderRadius: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
              >
                <option value='0px'>Sharp (0px)</option>
                <option value='0.25rem'>Subtle (4px)</option>
                <option value='0.5rem'>Standard (8px)</option>
                <option value='0.75rem'>Rounded (12px)</option>
                <option value='1rem'>Extra Rounded (16px)</option>
                <option value='1.5rem'>Pill (24px)</option>
              </select>
            </div>

            {/* Animation Speed */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Animation Speed</span>
              </label>
              <select
                value={t.animationSpeed || 'normal'}
                onChange={(e) => updateTheme({ animationSpeed: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
              >
                <option value='none'>None (Instant)</option>
                <option value='fast'>Fast (150ms)</option>
                <option value='normal'>Normal (300ms)</option>
                <option value='slow'>Slow (700ms)</option>
              </select>
            </div>

            {/* Gradient Direction */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Navigation className="w-3 h-3" />
                <span>Gradient Direction</span>
              </label>
              <select
                value={t.gradientDirection || 'to right'}
                onChange={(e) => updateTheme({ gradientDirection: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
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
            
            {/* Nexus Tab Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Bookmark className="w-3 h-3" />
                <span>Nexus Tab Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Nexus Bookmarks"
                value={settings?.nexusTabName || ''}
                onChange={(e) => onSaveSettings({ ...settings, nexusTabName: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
              />
            </div>
`;

content = content.replace('          </div>\n          <div className="mt-6 text-center">', additionalFields + '          </div>\n          <div className="mt-6 text-center">');

// Need to import icons
if (!content.includes('Type,')) {
    content = content.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, Type, Box, Zap, Navigation, Bookmark } from 'lucide-react';");
}

fs.writeFileSync('src/components/QuickCustomizePanel.tsx', content);
console.log("QuickCustomizePanel patched successfully.");
