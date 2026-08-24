const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `    syncLogs.unshift({
      id: \`slog-\${Date.now()}-emby\`,
      timestamp: now,
      source: "auto_sync",
      itemTitle: "Emby Integration",
      action: "Webhook Registration & Library Polling",
      platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
      status: "success",
      details: \`Successfully registered webhook for Emby server at \${appSettings.emby.serverUrl} and initiated library polling.\`
    });
  }

  persistDb();
  res.json({ success: true, settings: appSettings });
});`;

const replacement = `    syncLogs.unshift({
      id: \`slog-\${Date.now()}-emby\`,
      timestamp: now,
      source: "auto_sync",
      itemTitle: "Emby Integration",
      action: "Webhook Registration & Library Polling",
      platformsAffected: ["simkl", "mal", "anilist", "karakeep"] as PlatformType[],
      status: "success",
      details: \`Successfully registered webhook for Emby server at \${appSettings.emby.serverUrl} and initiated library polling.\`
    });
  }

  try {
    persistDb();
    res.status(200).json({ success: true, settings: appSettings });
  } catch (err) {
    console.error("[Settings] Persistence Error:", err);
    res.status(500).json({ success: false, error: "Failed to persist configuration." });
  }
});`;

content = content.replace(target, replacement);

fs.writeFileSync('server.ts', content);
