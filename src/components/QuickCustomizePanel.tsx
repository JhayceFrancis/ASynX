import React from 'react';
import { AppSettings } from '../types';
import {  X, Palette, Layout, Scaling, Layers, Type, Box, Zap, Navigation, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickCustomizePanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const QuickCustomizePanel: React.FC<QuickCustomizePanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const t = settings.theme || {};

  const updateTheme = (updates: any) => {
    onSaveSettings({
      ...settings,
      theme: { ...t, ...updates }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-16 right-4 w-80 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 shadow-2xl rounded-2xl z-[100] p-5 flex flex-col max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center space-x-2 text-gray-900 dark:text-gray-100">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>Quick Appearance</span>
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">

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

            {/* Button / Icon Color */}
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

            {/* Button Text Color */}
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

            {/* Base Theme Colors */}
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

            {/* View Mode (Grid/List/Block) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Layout className="w-3 h-3" />
                <span>Default View Type</span>
              </label>
              <select
                value={t.defaultViewMode || 'grid'}
                onChange={(e) => updateTheme({ defaultViewMode: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
              >
                <option value="grid">Grid (Cards)</option>
                <option value="list">List (Compact Table)</option>
                <option value="block">Block (Detailed Rows)</option>
              </select>
            </div>

            {/* Subheader Color */}
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

            {/* App Background Gradient */}
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
                        appBackgroundGradient: `linear-gradient(${t.gradientDirection || 'to bottom right'}, ${start}, ${end})` 
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
                        appBackgroundGradient: `linear-gradient(${t.gradientDirection || 'to bottom right'}, ${start}, ${end})` 
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

            {/* Layout Density */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Scaling className="w-3 h-3" />
                <span>Layout Density (Size)</span>
              </label>
              <select
                value={t.layoutDensity || 'comfortable'}
                onChange={(e) => updateTheme({ layoutDensity: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
              >
                <option value="compact">Compact (Dense)</option>
                <option value="comfortable">Comfortable (Default)</option>
                <option value="spacious">Spacious (Large)</option>
              </select>
            </div>

            {/* Card Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Panel Style</span>
              </label>
              <select
                value={t.cardStyle || 'flat'}
                onChange={(e) => updateTheme({ cardStyle: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100"
              >
                <option value="flat">Standard (Flat)</option>
                <option value="glass">Glassmorphism (Blur)</option>
                <option value="neumorphic">Neumorphic (Soft 3D)</option>
                <option value="outlined">Outlined (High Contrast)</option>
              </select>
            </div>
            

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
          </div>
          <div className="mt-6 text-center">
            <span className="text-[10px] text-gray-400">Settings save instantly.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
