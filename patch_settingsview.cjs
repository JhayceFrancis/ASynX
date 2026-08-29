const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const targetStr = `              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  Minimum Progress to Sync`;

const watchlistUI = `              {/* Watchlist Destination Section */}
              <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-neutral-900">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Watchlist Destination Defaults</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Define where your watchlists (e.g. from Plex RSS) are pushed when imported. "Local Only" keeps them in the ASynX database.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Global Default Destination</label>
                    <select
                      value={formState.syncRules?.watchlistDestination || 'local'}
                      onChange={(e) => setFormState({ ...formState, syncRules: { ...formState.syncRules, watchlistDestination: e.target.value } as any })}
                      className="w-full mt-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500"
                    >
                      <option value="local">Local Only</option>
                      <option value="simkl">Simkl</option>
                      <option value="mal">MyAnimeList</option>
                      <option value="anilist">AniList</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Custom Anime Destination (Optional)</label>
                    <select
                      value={formState.syncRules?.customWatchlistMapping?.anime || ''}
                      onChange={(e) => setFormState({ 
                         ...formState, 
                         syncRules: { 
                           ...formState.syncRules, 
                           customWatchlistMapping: { 
                             ...(formState.syncRules?.customWatchlistMapping || {}), 
                             anime: e.target.value 
                           } 
                         } as any 
                      })}
                      className="w-full mt-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500"
                    >
                      <option value="">Use Global Default</option>
                      <option value="local">Local Only</option>
                      <option value="simkl">Simkl</option>
                      <option value="mal">MyAnimeList</option>
                      <option value="anilist">AniList</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Custom TV Series Destination (Optional)</label>
                    <select
                      value={formState.syncRules?.customWatchlistMapping?.TVSeries || ''}
                      onChange={(e) => setFormState({ 
                         ...formState, 
                         syncRules: { 
                           ...formState.syncRules, 
                           customWatchlistMapping: { 
                             ...(formState.syncRules?.customWatchlistMapping || {}), 
                             TVSeries: e.target.value 
                           } 
                         } as any 
                      })}
                      className="w-full mt-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500"
                    >
                      <option value="">Use Global Default</option>
                      <option value="local">Local Only</option>
                      <option value="simkl">Simkl</option>
                      <option value="mal">MyAnimeList</option>
                      <option value="anilist">AniList</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Custom Films Destination (Optional)</label>
                    <select
                      value={formState.syncRules?.customWatchlistMapping?.films || ''}
                      onChange={(e) => setFormState({ 
                         ...formState, 
                         syncRules: { 
                           ...formState.syncRules, 
                           customWatchlistMapping: { 
                             ...(formState.syncRules?.customWatchlistMapping || {}), 
                             films: e.target.value 
                           } 
                         } as any 
                      })}
                      className="w-full mt-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500"
                    >
                      <option value="">Use Global Default</option>
                      <option value="local">Local Only</option>
                      <option value="simkl">Simkl</option>
                      <option value="mal">MyAnimeList</option>
                      <option value="anilist">AniList</option>
                    </select>
                  </div>
                </div>
              </div>

`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, watchlistUI + targetStr);
  fs.writeFileSync('src/components/SettingsView.tsx', code);
  console.log("Patched SettingsView");
} else {
  console.log("Could not find insertion point in SettingsView");
}
