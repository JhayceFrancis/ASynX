import React, { useState } from 'react';
import { Cloud, AlertTriangle, X } from 'lucide-react';
import { AppSettings } from '../types';

interface BackupSettingsViewProps {
  formState: AppSettings;
  setFormState: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const BackupSettingsView: React.FC<BackupSettingsViewProps> = ({ formState, setFormState }) => {
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRunBackup = async () => {
    if (!formState.automatedBackups?.enabled) {
      alert("Please enable backups first.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/backups/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, lastBackup: data.lastBackup } }));
        alert(data.message);
      } else {
        alert(data.error || 'Backup failed');
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/backups/restore', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload(); // Reload to fetch restored settings and libraries
      } else {
        alert(data.error || 'Restore failed');
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsProcessing(false);
      setShowRestoreModal(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-3 gap-3">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Automated Cloud Backups</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRunBackup}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-indigo-600/20 text-indigo-500 hover:bg-indigo-600/30 disabled:opacity-50 rounded-lg text-xs font-semibold transition"
            >
              {isProcessing ? 'Processing...' : 'Run Backup Now'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!formState.automatedBackups?.enabled) {
                  alert("Please enable backups first.");
                  return;
                }
                setShowRestoreModal(true);
              }}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-red-600/20 text-red-500 hover:bg-red-600/30 disabled:opacity-50 rounded-lg text-xs font-semibold transition"
            >
              Restore Backup
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-gray-800 dark:text-gray-200 font-semibold">Enable Automated Backups</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Regularly push an encrypted snapshot to your preferred cloud.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const isEnabled = formState.automatedBackups?.enabled || false;
                setFormState(prev => ({ 
                  ...prev, 
                  automatedBackups: { 
                    ...(prev.automatedBackups || { provider: 'github_gist', frequency: 'weekly', token: '', targetId: '' }),
                    enabled: !isEnabled 
                  } 
                }));
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${formState.automatedBackups?.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formState.automatedBackups?.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {formState.automatedBackups?.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Provider</label>
                <select
                  value={formState.automatedBackups.provider}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, provider: e.target.value as any } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="github_gist">GitHub Private Gist</option>
                  <option value="github_repo">GitHub Private Repo</option>
                  <option value="gdrive">Google Drive</option>
                  <option value="onedrive">OneDrive</option>
                </select>
              </div>
              
              <div>
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Frequency</label>
                <select
                  value={formState.automatedBackups.frequency}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, frequency: e.target.value as any } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly (Default)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {(formState.automatedBackups.provider === 'gdrive' || formState.automatedBackups.provider === 'onedrive') && (
                <div className="sm:col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl mt-2">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    {formState.automatedBackups.provider === 'gdrive' ? 'Google Drive' : 'Microsoft OneDrive'} Authentication
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    To enable automated uploads to {formState.automatedBackups.provider === 'gdrive' ? 'Google Drive' : 'OneDrive'}, you must provide an OAuth 2.0 access token or long-lived refresh token with file write permissions.
                  </p>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Auth Token (Personal Access Token / OAuth Refresh Token)</label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={formState.automatedBackups.token || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, token: e.target.value } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Encryption Key (AES-256)</label>
                <input
                  type="password"
                  placeholder="Optional secret to encrypt backup as asynx_data.enc"
                  value={formState.automatedBackups.encryptionKey || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, encryptionKey: e.target.value } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Target ID (Gist ID, Repo Name, or Folder ID)</label>
                <input
                  type="text"
                  placeholder="Leave blank to create new (Gist only)"
                  value={formState.automatedBackups.targetId || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, automatedBackups: { ...prev.automatedBackups!, targetId: e.target.value } }))}
                  className="w-full mt-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-600 dark:text-gray-400 font-medium text-xs">Last Backup</label>
                <div className="mt-1 text-xs text-gray-800 dark:text-gray-200 font-mono">
                  {formState.automatedBackups?.lastBackup ? new Date(formState.automatedBackups.lastBackup).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <button
              onClick={() => !isProcessing && setShowRestoreModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Overwrite Local Settings?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Restoring will fetch settings from <span className="font-mono text-gray-700 dark:text-gray-300">{formState.automatedBackups?.provider}</span> and completely replace your local database and configurations. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestoreBackup}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-red-600/20 disabled:opacity-50"
              >
                {isProcessing ? 'Restoring...' : 'Yes, Restore Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
