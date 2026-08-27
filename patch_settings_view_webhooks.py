import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

replacement = """
            <div className="flex items-center space-x-2">
              <PlexLogo className="w-4 h-4 text-[#E5A00D]" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Media Servers & Scrobblers (Plex, Jellyfin, Emby)</h3>
            </div>
            {(formState.plex?.connected || formState.jellyfin?.connected || formState.emby?.connected) ? (
              <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Webhooks Active
              </span>
            ) : (
              <span className="text-xs text-gray-500 font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700">
                Disconnected
              </span>
            )}
"""

content = re.sub(r'<div className="flex items-center space-x-2">\s*<PlexLogo.*?</div>\s*<span className="text-xs text-purple-400.*?Webhooks Active\s*</span>', replacement, content, flags=re.DOTALL)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
