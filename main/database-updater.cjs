const { app } = require('electron');
const fs = require('fs/promises');
const path = require('path');

class AnimeRelationsUpdater {
  constructor() {
    this.sourceUrl = 'https://raw.githubusercontent.com/erengy/anime-relations/master/anime-relations.txt';
    this.cacheFile = path.join(app.getPath('userData'), 'anime-relations-cache.json');
    this.updateIntervalHours = 24;
  }

  async init() {
    try {
      const needsUpdate = await this.checkIfUpdateNeeded();
      
      if (needsUpdate) {
        console.log('[Updater] Fetching latest anime-relations database...');
        const rawData = await this.downloadDatabase();
        const parsedJson = this.parseRelationsData(rawData);
        await this.saveCache(parsedJson);
        console.log('[Updater] Database successfully updated and cached.');
      } else {
        console.log('[Updater] Local database is up to date.');
      }
    } catch (error) {
      console.error('[Updater] Failed to update database:', error.message);
    }
  }

  async checkIfUpdateNeeded() {
    try {
      const stats = await fs.stat(this.cacheFile);
      const hoursSinceUpdate = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
      return hoursSinceUpdate > this.updateIntervalHours;
    } catch (error) {
      return true;
    }
  }

  async downloadDatabase() {
    const response = await fetch(this.sourceUrl, { timeout: 10000 });
    return await response.text();
  }

  parseRelationsData(rawText) {
    const lines = rawText.split('\n');
    const database = {};
    let currentMalId = null;

    const idRegex = /^- (\d+) ~ (\d+)/; 
    const ruleRegex = /^(\d+)-?(\d+|\?)? -> (\d+)x(\d+)-?(\d+|\?)?/;

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;

      const idMatch = line.match(idRegex);
      if (idMatch) {
        currentMalId = idMatch[1];
        database[currentMalId] = {
          tvdbId: parseInt(idMatch[2], 10),
          rules: []
        };
        continue;
      }

      const ruleMatch = line.match(ruleRegex);
      if (ruleMatch && currentMalId) {
        database[currentMalId].rules.push({
          startAbs: parseInt(ruleMatch[1], 10),
          endAbs: ruleMatch[2] === '?' ? null : parseInt(ruleMatch[2], 10),
          season: parseInt(ruleMatch[3], 10),
          startEp: parseInt(ruleMatch[4], 10),
          endEp: ruleMatch[5] === '?' ? null : parseInt(ruleMatch[5], 10)
        });
      }
    }

    return database;
  }

  async saveCache(data) {
    await fs.writeFile(this.cacheFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  async loadCache() {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }
}

module.exports = AnimeRelationsUpdater;
