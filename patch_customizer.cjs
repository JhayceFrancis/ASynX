const fs = require('fs');
let content = fs.readFileSync('src/components/QuickCustomizePanel.tsx', 'utf8');

const target = `            {/* Base Theme Colors */}`;

const newControls = `
            {/* Subheading Text */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Type className="w-3 h-3" />
                <span>Subheading Text</span>
              </label>
              <input
                type="text"
                value={t.subheadingText || ''}
                onChange={(e) => updateTheme({ subheadingText: e.target.value })}
                placeholder="e.g. Media Sync Engine"
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Header Background */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Layout className="w-3 h-3" />
                <span>Heading BG (Solid or Gradient)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateTheme({ headerColor: 'transparent', headerIsGradient: false })}
                  className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-neutral-700"
                >Clear</button>
                {['#000000', '#ffffff', '#1f2937', '#111827', '#4f46e5'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateTheme({ headerColor: color, headerIsGradient: false })}
                    className="w-6 h-6 rounded-full border-2 border-transparent"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {/* Gradient Options */}
                <button
                  onClick={() => updateTheme({ headerIsGradient: true, headerGradientColors: ['#ff9a9e', '#fecfef'], headerGradientDirection: 'to right' })}
                  className="w-6 h-6 rounded-full"
                  style={{ background: 'linear-gradient(to right, #ff9a9e, #fecfef)' }}
                />
                <button
                  onClick={() => updateTheme({ headerIsGradient: true, headerGradientColors: ['#4facfe', '#00f2fe'], headerGradientDirection: 'to right' })}
                  className="w-6 h-6 rounded-full"
                  style={{ background: 'linear-gradient(to right, #4facfe, #00f2fe)' }}
                />
                <button
                  onClick={() => updateTheme({ headerIsGradient: true, headerGradientColors: ['#43e97b', '#38f9d7'], headerGradientDirection: 'to right' })}
                  className="w-6 h-6 rounded-full"
                  style={{ background: 'linear-gradient(to right, #43e97b, #38f9d7)' }}
                />
              </div>
            </div>

            {/* Button / Icon Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Button & Icon Color</span>
              </label>
              <div className="flex flex-wrap gap-2">
                 {['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#000000', '#ffffff'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateTheme({ buttonColor: color, iconColor: color })}
                    className="w-6 h-6 rounded-full border-2 border-transparent"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  onClick={() => updateTheme({ buttonColor: '', iconColor: 'currentColor' })}
                  className="px-2 py-1 text-[10px] rounded border border-gray-200 dark:border-neutral-700"
                >Default</button>
              </div>
            </div>

            {/* Button Text Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Type className="w-3 h-3" />
                <span>Button Text Color</span>
              </label>
              <div className="flex flex-wrap gap-2">
                 {['#ffffff', '#000000', '#e5e7eb', '#374151'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateTheme({ buttonTextColor: color })}
                    className="w-6 h-6 rounded-full border-2 border-transparent"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Base Theme Colors */}`;

if(content.includes(target)) {
   content = content.replace(target, newControls);
   
   // We need to ensure `Type` is imported from 'lucide-react'
   if (!content.includes('Type,')) {
      content = content.replace('import { Layout', 'import { Layout, Type');
   }
   
   fs.writeFileSync('src/components/QuickCustomizePanel.tsx', content);
   console.log('QuickCustomizePanel patched.');
} else {
   console.log('Target not found in QuickCustomizePanel.');
}
