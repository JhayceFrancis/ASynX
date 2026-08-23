import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const oldRegex = /app\.post\("\/api\/webhooks\/karakeep", \(req, res\) => \{[\s\S]*?res\.status\(200\)\.json\(\{ status: "ok", message: "KaraKeep webhook processed" \}\);\n\}\);/;

const newWebhook = `app.post("/api/webhooks/karakeep", (req, res) => {
  console.log("[KaraKeep Webhook] Received payload:", req.body);
  const event = req.body.event || 'watched';
  const showName = req.body.anime_title || req.body.title || "Unknown Anime";
  const season = req.body.season || 1;
  const episode = req.body.episode || 1;
  
  let matchedItem = libraryItems.find(i => 
    i.title.toLowerCase().includes(showName.toLowerCase()) ||
    showName.toLowerCase().includes(i.title.toLowerCase().slice(0, 8))
  );

  if (!matchedItem) {
    matchedItem = libraryItems[0];
  }

  const now = new Date().toISOString();
  if (matchedItem) {
    if (matchedItem.platforms.simkl) {
      matchedItem.platforms.simkl.episode = Math.max(matchedItem.platforms.simkl.episode, episode);
      matchedItem.platforms.simkl.updatedAt = now;
    }
    if (matchedItem.platforms.mal && matchedItem.platforms.mal.id !== 'mal-none') {
      matchedItem.platforms.mal.episode = Math.max(matchedItem.platforms.mal.episode, episode);
      matchedItem.platforms.mal.updatedAt = now;
    }
    if (matchedItem.platforms.anilist) {
      matchedItem.platforms.anilist.episode = Math.max(matchedItem.platforms.anilist.episode, episode);
      matchedItem.platforms.anilist.updatedAt = now;
    }
    if (matchedItem.platforms.karakeep) {
      matchedItem.platforms.karakeep.episode = Math.max(matchedItem.platforms.karakeep.episode, episode);
      matchedItem.platforms.karakeep.updatedAt = now;
    } else {
      matchedItem.platforms.karakeep = {
        id: "karakeep-" + Date.now(),
        episode: episode,
        status: "watching",
        score: 0,
        updatedAt: now,
        synced: true
      };
    }
    matchedItem.hasConflict = false;
    delete matchedItem.conflictDetails;
  }
  
  const log = {
    id: "wh-" + crypto.randomUUID(),
    timestamp: now,
    source: "karakeep",
    event: event,
    mediaTitle: req.body.title || "Unknown Anime",
    grandparentTitle: showName,
    parentIndex: season,
    index: episode,
    user: req.body.user || "karakeep_user",
    player: "KaraKeep Crawler",
    progressPercent: 100,
    matchedItemId: matchedItem?.id,
    rawPayload: req.body
  };
  
  webhookLogs.unshift(log);
  
  syncLogs.unshift({
    id: "slog-" + Date.now(),
    timestamp: now,
    source: "karakeep",
    itemTitle: matchedItem?.title || showName,
    action: "KaraKeep " + event + " -> S" + season + "E" + episode,
    platformsAffected: ["simkl", "mal", "anilist", "karakeep"],
    status: "success",
    details: "Ingested KaraKeep webhook. Updated Simkl, MAL, AniList & KaraKeep."
  });
  
  persistDb();
  
  if (appSettings.daemonSettings?.autoScrobbleLocal) {
     executeBackendDockerSyncDaemonCycle();
  }
  
  res.status(200).json({ status: "ok", message: "KaraKeep webhook processed" });
});`;

content = content.replace(oldRegex, newWebhook);
fs.writeFileSync('server.ts', content);
