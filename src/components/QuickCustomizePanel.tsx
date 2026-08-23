import React from 'react';
import { AppSettings } from '../types';
import { X, Palette, Layout, Scaling, Layers, Type } from 'lucide-react';
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

            {/* Base Theme Colors */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Palette className="w-3 h-3" />
                <span>Base Accent</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateTheme({ accentColor: color, isGradient: false })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${t.accentColor === color && !t.isGradient ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
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
                    className={`px-2 py-1 text-[10px] rounded border transition ${t.subheaderColor === option.value || (!t.subheaderColor && option.value === '') ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-neutral-700'}`}
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
                    className={`px-2 py-1.5 text-xs text-left rounded border transition ${t.appBackgroundGradient === option.value || (!t.appBackgroundGradient && option.value === '') ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-neutral-700'}`}
                  >
                    {option.label}
                  </button>
                ))}
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
            
          </div>
          <div className="mt-6 text-center">
            <span className="text-[10px] text-gray-400">Settings save instantly.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
