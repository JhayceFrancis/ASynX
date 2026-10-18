const express = require('express');
const cors = require('cors');
const SyncEngine = require('./sync-engine.cjs');

function startLocalApi(bookmarkManager, relationsDb = {}) {
  const app = express();
  const PORT = 14000;

  app.use(cors());
  app.use(express.json());

  // Initialise the cross-platform sync engine for local API consumers
  const syncEngine = new SyncEngine(relationsDb);

  app.get('/api/bookmarks', async (req, res) => {
    const config = await bookmarkManager.getDatasetConfig();
    const records = await bookmarkManager.getBookmarks();
    
    res.json({
      datasetName: config.datasetName,
      records: records
    });
  });

  app.post('/api/bookmarks/rename', async (req, res) => {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ error: "Name required" });
    
    await bookmarkManager.renameDataset(newName);
    res.json({ success: true, datasetName: newName });
  });

  // Route 1: Universal ID & Deep-Link Crosswalk Resolver (Used by public/content.js)
  app.get('/api/sync/resolve', async (req, res) => {
    try {
      const ids = await syncEngine.resolveCrossPlatformIds({
        mal: req.query.mal ? Number(req.query.mal) : null,
        anilist: req.query.anilist ? Number(req.query.anilist) : null,
        anidb: req.query.anidb ? Number(req.query.anidb) : null,
        simkl: req.query.simkl ? Number(req.query.simkl) : null,
        trakt: req.query.trakt ? req.query.trakt : null,
        imdb: req.query.imdb || null,
        tvdb: req.query.tvdb ? Number(req.query.tvdb) : null,
        type: req.query.type || 'anime'
      });

      const links = {
        simkl: ids.simkl ? `https://simkl.com/${ids.type === 'movie' ? 'movies' : (ids.type === 'tv' ? 'tv' : 'anime')}/${ids.simkl}` : null,
        anilist: ids.anilist ? `https://anilist.co/anime/${ids.anilist}` : null,
        mal: ids.mal ? `https://myanimelist.net/anime/${ids.mal}` : null,
        anidb: ids.anidb ? `https://anidb.net/anime/${ids.anidb}` : null,
        trakt: ids.trakt ? `https://trakt.tv/shows/${ids.trakt}` : null
      };

      res.json({ success: true, ids, links });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Route 2: Direct Multi-Tracker Sync Push Trigger
  app.post('/api/sync/push', async (req, res) => {
    try {
      const { externalId, statePayload, tokens } = req.body;
      if (tokens) syncEngine.updateTokens(tokens);

      const report = await syncEngine.synchroniseMediaState(externalId || {}, statePayload || {});
      res.json({ success: true, ...report });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Local API] Serving bookmarks and sync engine to network on port ${PORT}`);
  });
}

module.exports = startLocalApi;
