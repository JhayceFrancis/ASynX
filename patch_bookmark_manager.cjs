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

  async getUnsyncedBookmarks() {
    const bookmarks = await this.getBookmarks();
    return bookmarks.filter(b => b.Synced_To_Hub === 'false');
  }

  async updateSyncStatus(timestamp, status) {
    try {
      const data = await fs.readFile(this.csvPath, 'utf-8');
      const lines = data.trim().split('\n');
      const headers = lines[0].split(',');
      
      let updated = false;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith(timestamp + ',')) {
           // We found the line to update
           const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
           // Find index of Synced_To_Hub
           const syncIndex = headers.indexOf('Synced_To_Hub');
           if (syncIndex !== -1 && values.length > syncIndex) {
              values[syncIndex] = status.toString();
           } else if (syncIndex !== -1) {
              while (values.length < syncIndex) values.push('');
              values.push(status.toString());
           }
           lines[i] = values.join(',');
           updated = true;
           break;
        }
      }
      
      if (updated) {
         await fs.writeFile(this.csvPath, lines.join('\n') + '\n', 'utf-8');
      }
    } catch (error) {
       console.error('[BookmarkManager] Update Sync Status Error:', error.message);
    }
  }
}

module.exports = BookmarkManager;
