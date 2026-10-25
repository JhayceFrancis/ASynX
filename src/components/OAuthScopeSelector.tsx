import React, { useState, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, Check, Sparkles, SlidersHorizontal, Lock } from 'lucide-react';
import { 
  OAUTH_SCOPES_CONFIG, 
  getLeastPrivilegeScopes, 
  getAllScopes, 
  isLeastPrivilege 
} from '../constants/oauthScopes';

interface OAuthScopeSelectorProps {
  provider: 'simkl' | 'mal' | 'anilist';
  selectedScopes?: string[];
  onChange: (scopes: string[]) => void;
  compact?: boolean;
}

export function OAuthScopeSelector({
  provider,
  selectedScopes,
  onChange,
  compact = false
}: OAuthScopeSelectorProps) {
  // 1. React State Ordering: Hooks declared at the top of the functional component
  const [isExpanded, setIsExpanded] = useState(!compact);

  const config = OAUTH_SCOPES_CONFIG[provider];

  const activeScopes = useMemo(() => {
    if (selectedScopes && Array.isArray(selectedScopes) && selectedScopes.length > 0) {
      return selectedScopes;
    }
    return config?.defaultScopes || [];
  }, [selectedScopes, config]);

  const isStrictLeastPrivilege = useMemo(() => {
    return isLeastPrivilege(provider, activeScopes);
  }, [provider, activeScopes]);

  if (!config) return null;

  const handleToggleScope = (scopeId: string) => {
    if (activeScopes.includes(scopeId)) {
      // Don't allow deselecting everything if it leaves it empty, or allow it with caution
      const updated = activeScopes.filter(s => s !== scopeId);
      onChange(updated);
    } else {
      onChange([...activeScopes, scopeId]);
    }
  };

  const handleApplyLeastPrivilege = () => {
    onChange(getLeastPrivilegeScopes(provider));
  };

  const handleSelectAll = () => {
    onChange(getAllScopes(provider));
  };

  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-2xl bg-gray-50/50 dark:bg-black/30 p-4 space-y-3">
      {/* Header and Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Granular OAuth Scopes</span>
              {isStrictLeastPrivilege ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Least Privilege Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Custom Permissions
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Only grant the minimum permissions required for synchronization and scrobbling.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleApplyLeastPrivilege}
            title="Reset to minimal least-privilege permissions"
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition flex items-center ${
              isStrictLeastPrivilege
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-3 h-3 mr-1 text-emerald-500" />
            Least Privilege Preset
          </button>
          
          {compact && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scope Toggles List */}
      {isExpanded && (
        <div className="space-y-2 pt-1 border-t border-gray-200/60 dark:border-neutral-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {config.scopes.map((scope) => {
              const isChecked = activeScopes.includes(scope.id);
              return (
                <label
                  key={scope.id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggleScope(scope.id);
                  }}
                  className={`flex items-start p-2.5 rounded-xl border text-left cursor-pointer transition select-none ${
                    isChecked
                      ? 'bg-white dark:bg-neutral-900 border-indigo-500/40 dark:border-indigo-500/50 shadow-xs'
                      : 'bg-white/40 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center h-5 mr-2.5">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition border ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {scope.label}
                      </span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                        {scope.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                      {scope.description}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {scope.recommendedForLeastPrivilege ? (
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                          <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                          Recommended (Minimal)
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">
                          {scope.level === 'elevated' ? 'Elevated Access' : 'Optional Feature'}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1 pt-1">
            <span>
              Selected: <strong className="text-gray-800 dark:text-gray-200">{activeScopes.length}</strong> of {config.scopes.length} scopes
            </span>
            <div className="space-x-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleApplyLeastPrivilege}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
              >
                Reset to Least-Privilege
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
