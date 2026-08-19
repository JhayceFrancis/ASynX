const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /private commitSession\(payload: any\) \{[\s\S]*?\}\n\}/;

const replacement = `private commitSession(payload: any) {
    const { title, episodeNumber, player, mediaType, mediaId } = payload;
    
    // Attempt to update local database state
    let matchedItem = libraryItems.find(i => i.id === mediaId || i.title.toLowerCase() === title?.toLowerCase());
    if (matchedItem) {
      if (matchedItem.platforms.simkl) matchedItem.platforms.simkl.episode = Math.max(matchedItem.platforms.simkl.episode, episodeNumber);
      if (matchedItem.platforms.mal) matchedItem.platforms.mal.episode = Math.max(matchedItem.platforms.mal.episode, episodeNumber);
      if (matchedItem.platforms.anilist) matchedItem.platforms.anilist.episode = Math.max(matchedItem.platforms.anilist.episode, episodeNumber);
    }

    const newLog = {
      id: \`sync-\${Date.now()}\`,
      timestamp: new Date().toISOString(),
      source: player || "Local Player",
      targetPlatform: "all",
      action: "scrobble",
      status: "success" as "success",
      itemTitle: matchedItem ? matchedItem.title : (title || "Unknown"),
      platformsAffected: ["simkl", "mal", "anilist"] as PlatformType[],
      details: \`Scrobbled \${title || "Unknown"} Ep \${episodeNumber} from \${player} (Centralized Playback Session Manager)\`
    };
    syncLogs.unshift(newLog);
    persistDb();
    
    if (app.locals.io) {
       app.locals.io.emit('state_change', { type: 'scrobble_committed', payload });
    }
  }
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
