const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetPush = `        libraryItems.push({
          id: 'plex-wl-' + Date.now() + Math.floor(Math.random() * 1000),
          title: title,
          mediaType: 'TV Series', // Default assumption
          coverImage: 'https://via.placeholder.com/150x225.png?text=' + encodeURIComponent(title),
          totalEpisodes: 12,
          year: new Date().getFullYear(),
          genres: [],
          platforms: {
            simkl: { id: 'simkl-wl', status: 'plan_to_watch', episode: 0, score: 0, updatedAt: now, synced: false },
            plex: { id: 'plex-wl', status: 'plan_to_watch', episode: 0, score: 0, updatedAt: now, synced: true }
          } as any,
          hasConflict: false
        });`;

const newPush = `        // Watchlist Mapping Engine
        const cat = 'TVSeries';
        const mappedDest = appSettings.syncRules.customWatchlistMapping?.[cat] 
            || appSettings.syncRules.watchlistDestination 
            || 'local';

        let platformsObj: any = {
          plex: { id: 'plex-wl', status: 'plan_to_watch', episode: 0, score: 0, updatedAt: now, synced: true }
        };

        if (mappedDest !== 'local') {
          // Send to specific remote platform
          platformsObj[mappedDest] = { id: \`\${mappedDest}-wl\`, status: 'plan_to_watch', episode: 0, score: 0, updatedAt: now, synced: false };
        } else {
          // Default to local/simkl for pure tracking
          platformsObj.simkl = { id: 'simkl-wl', status: 'plan_to_watch', episode: 0, score: 0, updatedAt: now, synced: false };
        }

        libraryItems.push({
          id: 'plex-wl-' + Date.now() + Math.floor(Math.random() * 1000),
          title: title,
          mediaType: 'TV Series',
          coverImage: 'https://via.placeholder.com/150x225.png?text=' + encodeURIComponent(title),
          totalEpisodes: 12,
          year: new Date().getFullYear(),
          genres: [],
          platforms: platformsObj,
          hasConflict: false
        });`;

if(code.includes(targetPush)) {
    code = code.replace(targetPush, newPush);
    fs.writeFileSync('server.ts', code);
    console.log("Updated plex watchlist logic");
} else {
    console.log("Could not find plex watchlist logic");
}
