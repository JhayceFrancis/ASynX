const fs = require('fs/promises');
const path = require('path');
const { app } = require('electron');

class BookmarkManager {
  constructor() {
    this.userDataPath = app.getPath('userData');
    this.csvPath = path.join(this.userDataPath, 'local_bookmarks.csv');
    this.configPath = path.join(this.userDataPath, 'dataset_config.json');
  }

  async getDatasetConfig() {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { datasetName: "Watched local media history" };
    }
  }

  async renameDataset(newName) {
    const config = await this.getDatasetConfig();
    config.datasetName = newName;
    await fs.writeFile(this.configPath, JSON.stringify(config), 'utf-8');
    return config;
  }

  async getBookmarks() {
    try {
      const data = await fs.readFile(this.csvPath, 'utf-8');
      const lines = data.trim().split('\n');
      const headers = lines[0].split(',');
      
      return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        let row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : null;
        });
        return row;
      });
    } catch (error) {
      console.error('[BookmarkManager] Read Error:', error.message);
      return [];
    }
  }
}

module.exports = BookmarkManager;
