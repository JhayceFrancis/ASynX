const express = require('express');
const cors = require('cors');

function startLocalApi(bookmarkManager) {
  const app = express();
  const PORT = 14000;

  app.use(cors());
  app.use(express.json());

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Local API] Serving bookmarks to network on port ${PORT}`);
  });
}

module.exports = startLocalApi;
