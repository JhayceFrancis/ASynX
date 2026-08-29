const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const watchlistEndpoint = `
// Sync Plex RSS Watchlist
app.post("/api/sync/plex-watchlist", async (req, res) => {
  if (!appSettings.plex.watchlistRssUrl) {
    return res.status(400).json({ error: "Plex Watchlist RSS URL is not configured." });
  }

  try {
    const rssRes = await fetch(createSafeUrl(appSettings.plex.watchlistRssUrl, ['rss.plex.tv']));
    if (!rssRes.ok) throw new Error("Failed to fetch RSS feed");
    const xml = await rssRes.text();
    
    // Very basic regex to extract titles from RSS items
    const itemRegex = /<item>[\\s\\S]*?<title>(.*?)<\\/title>[\\s\\S]*?<\\/item>/g;
    let match;
    let addedCount = 0;
    const now = new Date().toISOString();

    while ((match = itemRegex.exec(xml)) !== null) {
      // Decode XML entities if needed (simple replacement for common ones)
      const title = match[1].replace(/<!\\[CDATA\\[(.*?)\\]\\]>/g, '$1')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'");

      // Check if item already exists
      const existing = libraryItems.find(i => i.title.toLowerCase() === title.toLowerCase());
      if (!existing) {
        // Add to libraryItems
        libraryItems.push({
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
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      syncLogs.unshift({
        id: \`slog-wl-\${Date.now()}\`,
        timestamp: now,
        source: "plex_watchlist",
        itemTitle: "Plex RSS Watchlist",
        action: "Watchlist Sync",
        platformsAffected: ["plex"] as PlatformType[],
        status: "success",
        details: \`Imported \${addedCount} items from Plex Watchlist.\`
      });
      persistDb();
    }

    res.json({ success: true, message: \`Synced \${addedCount} new items from Plex Watchlist.\` });
  } catch (err: any) {
    SystemLogger.error('Watchlist Sync', err.message);
    res.status(500).json({ error: "Failed to sync Plex Watchlist." });
  }
});
`;

if (!code.includes('/api/sync/plex-watchlist')) {
  // Insert before the error handlers at the end, or before `app.get("/api/sync/status"`
  const target = `// Get Sync Metrics & Status`;
  code = code.replace(target, watchlistEndpoint + '\n' + target);
  fs.writeFileSync('server.ts', code);
  console.log('Patched Plex Watchlist Endpoint');
} else {
  console.log('Already patched');
}
