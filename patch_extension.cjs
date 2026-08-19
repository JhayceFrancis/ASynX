const fs = require('fs');
let code = fs.readFileSync('src/components/ExtensionCompanionView.tsx', 'utf8');

// Add new state variables
const importRegex = /const \[testProgress, setTestProgress\] = useState\(88\);/;
const stateInjection = `const [testProgress, setTestProgress] = useState(88);

  const [isEditingMatch, setIsEditingMatch] = useState(false);
  const [editTitle, setEditTitle] = useState(state.currentMedia?.title || '');
  const [editSeason, setEditSeason] = useState(state.currentMedia?.season || 1);
  const [editEpisode, setEditEpisode] = useState(state.currentMedia?.episode || 1);

  React.useEffect(() => {
    if (state.currentMedia && !isEditingMatch) {
      setEditTitle(state.currentMedia.title);
      setEditSeason(state.currentMedia.season);
      setEditEpisode(state.currentMedia.episode);
    }
  }, [state.currentMedia, isEditingMatch]);

  const handleSaveMatch = () => {
    onTriggerExtensionAction({ 
      action: 'correct_mismatch', 
      payload: { title: editTitle, season: editSeason, episode: editEpisode } 
    });
    setIsEditingMatch(false);
    // Locally override simulation state for instant UI feedback in the view
    setSelectedItemTitle(editTitle);
    setTestEpisode(editEpisode);
  };
`;
code = code.replace(importRegex, stateInjection);

// Replace detector box
const detectorBoxRegex = /<h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Quick Extension Actions \*\/\}/;

const newDetectorBox = `
              {!isEditingMatch ? (
                <>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                    {state.currentMedia?.title}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
                      <span>Season {state.currentMedia?.season} • Episode {state.currentMedia?.episode}</span>
                      <span className="text-cyan-300 font-semibold">{state.currentMedia?.progressPercent}% watched</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-50 dark:bg-black rounded-full h-2 overflow-hidden border border-gray-200 dark:border-neutral-900">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: \`\${state.currentMedia?.progressPercent || 85}%\` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button 
                      onClick={() => setIsEditingMatch(true)} 
                      className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Correct Mismatch</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-xl p-2 space-y-2 animate-fade-in">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold mb-0.5 block">Matched Title</label>
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white dark:bg-black border border-gray-300 dark:border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold mb-0.5 block">Season</label>
                      <input 
                        type="number" 
                        value={editSeason}
                        onChange={(e) => setEditSeason(Number(e.target.value))}
                        className="w-full bg-white dark:bg-black border border-gray-300 dark:border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold mb-0.5 block">Episode</label>
                      <input 
                        type="number" 
                        value={editEpisode}
                        onChange={(e) => setEditEpisode(Number(e.target.value))}
                        className="w-full bg-white dark:bg-black border border-gray-300 dark:border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1 space-x-2">
                    <button 
                      onClick={() => setIsEditingMatch(false)} 
                      className="text-[10px] px-2 py-1 font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveMatch} 
                      className="text-[10px] px-2 py-1 font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-md transition cursor-pointer"
                    >
                      Apply Correction
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Extension Actions */}`;

code = code.replace(detectorBoxRegex, newDetectorBox);

fs.writeFileSync('src/components/ExtensionCompanionView.tsx', code);
