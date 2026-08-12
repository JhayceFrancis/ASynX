#!/bin/bash
cat << 'ROUTE' >> server.ts

// Remote Sync Endpoints
app.post("/api/remote-sync/push", async (req, res) => {
  // Push local DB to remote
  if (!appSettings.remoteSync?.enabled || !appSettings.remoteSync.serverUrl) {
    return res.status(400).json({ error: "Remote sync is not configured or enabled." });
  }

  try {
    const payload = {
      apiKey: appSettings.remoteSync.apiKey,
      data: {
        appSettings,
        libraryItems,
        syncLogs,
        webhookLogs,
        extensionState
      }
    };

    const response = await fetch(`${appSettings.remoteSync.serverUrl}/api/remote-sync/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      appSettings.remoteSync.lastSync = new Date().toISOString();
      persistDb();
      return res.json({ success: true, message: "Pushed to remote successfully", timestamp: appSettings.remoteSync.lastSync });
    } else {
      return res.status(response.status).json({ error: "Failed to push to remote server." });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/remote-sync/pull", async (req, res) => {
  if (!appSettings.remoteSync?.enabled || !appSettings.remoteSync.serverUrl) {
    return res.status(400).json({ error: "Remote sync is not configured or enabled." });
  }

  try {
    const response = await fetch(`${appSettings.remoteSync.serverUrl}/api/remote-sync/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: appSettings.remoteSync.apiKey })
    });

    if (response.ok) {
      const remoteDb = await response.json();
      if (remoteDb && remoteDb.libraryItems) {
        // Simple overwrite for demonstration
        appSettings = remoteDb.appSettings || appSettings;
        libraryItems = remoteDb.libraryItems;
        syncLogs = remoteDb.syncLogs || syncLogs;
        webhookLogs = remoteDb.webhookLogs || webhookLogs;
        extensionState = remoteDb.extensionState || extensionState;
        
        appSettings.remoteSync!.lastSync = new Date().toISOString();
        persistDb();
        return res.json({ success: true, message: "Pulled from remote successfully", timestamp: appSettings.remoteSync!.lastSync });
      }
    }
    return res.status(response.status).json({ error: "Failed to pull from remote server." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Remote Server Receiver Endpoints (When running in Docker as the remote backend)
app.post("/api/remote-sync/receive", (req, res) => {
  const { apiKey, data } = req.body;
  if (!appSettings.remoteSync || apiKey !== appSettings.remoteSync.apiKey) {
    return res.status(401).json({ error: "Unauthorized. Invalid remote API Key." });
  }

  if (data && data.libraryItems) {
    appSettings = data.appSettings || appSettings;
    libraryItems = data.libraryItems;
    syncLogs = data.syncLogs || syncLogs;
    webhookLogs = data.webhookLogs || webhookLogs;
    extensionState = data.extensionState || extensionState;
    persistDb();
    return res.json({ success: true, message: "Data received and saved." });
  }
  return res.status(400).json({ error: "Invalid payload." });
});

app.post("/api/remote-sync/export", (req, res) => {
  const { apiKey } = req.body;
  if (!appSettings.remoteSync || apiKey !== appSettings.remoteSync.apiKey) {
    return res.status(401).json({ error: "Unauthorized. Invalid remote API Key." });
  }

  return res.json({
    appSettings,
    libraryItems,
    syncLogs,
    webhookLogs,
    extensionState
  });
});

ROUTE
