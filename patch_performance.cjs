const fs = require('fs');
const file = 'src/components/SyncPerformanceView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update defaultLayout to include ScrobbleFeed
content = content.replace(
  "  { i: 'latency', x: 6, y: 27, w: 6, h: 10, type: 'LatencyChart' }",
  "  { i: 'latency', x: 6, y: 27, w: 6, h: 10, type: 'LatencyChart' },\n  { i: 'scrobble_feed', x: 0, y: 37, w: 12, h: 12, type: 'ScrobbleFeed' }"
);

// Define ScrobbleFeed component logic
const scrobbleFeedComponent = `
    {
      type: 'ScrobbleFeed',
      name: 'Scrobble Activity Feed',
      component: () => {
        // Simulated real-time scrobble events feed
        const [events, setEvents] = React.useState([
          { id: '1', time: new Date(Date.now() - 5000), file: 'Boku no Hero Academia S7 - 12.mkv', action: 'playing', status: 'accepted', reason: 'Threshold met' },
          { id: '2', time: new Date(Date.now() - 45000), file: 'Sample_Clip_01.mp4', action: 'playing', status: 'rejected', reason: 'Duration < 3 mins' },
          { id: '3', time: new Date(Date.now() - 120000), file: 'Sousou no Frieren - 28.mkv', action: 'completed', status: 'accepted', reason: 'Watched > 80%' },
        ]);

        return (
          <div className="p-6 h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center flex-shrink-0">
              <MonitorPlay className="w-4 h-4 mr-2 text-indigo-500" />
              Scrobble Activity Feed
            </h3>
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-neutral-800 rounded-xl">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{ev.file}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {ev.time.toLocaleTimeString()} • {ev.action.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center space-x-2 flex-shrink-0">
                    <span className={\`text-xs px-2 py-1 rounded-md font-medium border \${
                      ev.status === 'accepted' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }\`}>
                      {ev.status === 'accepted' ? 'Accepted' : 'Rejected'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-24 text-right truncate">
                      {ev.reason}
                    </span>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  No recent scrobble activity.
                </div>
              )}
            </div>
          </div>
        );
      }
    },`;

content = content.replace('const availableWidgets = [', 'const availableWidgets = [\n' + scrobbleFeedComponent);

fs.writeFileSync(file, content);
console.log("Patched SyncPerformanceView");
