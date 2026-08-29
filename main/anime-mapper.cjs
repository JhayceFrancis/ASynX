class AnimeMapper {
  constructor(relationsDb) {
    this.relationsDb = relationsDb || {}; 
  }

  /**
   * Converts an absolute episode number into a Season/Episode object.
   * 
   * @param {string} malId - The MAL ID of the anime
   * @param {number} absoluteEpisode - The raw episode number parsed from the file
   * @returns {Object|null} { season: number, episode: number } or null if no rule matches
   */
  convertToSeasonEpisode(malId, absoluteEpisode) {
    const rules = this.relationsDb[malId]?.rules;
    
    if (!rules || rules.length === 0) {
      // Fallback: If no mapping exists, assume it is a standard Season 1
      return { season: 1, episode: absoluteEpisode };
    }

    // Find the specific season arc that contains this absolute episode
    const matchingRule = rules.find(rule => 
      absoluteEpisode >= rule.startAbs && 
      (rule.endAbs === null || absoluteEpisode <= rule.endAbs) // null endAbs means the season is ongoing
    );

    if (!matchingRule) return null;

    // Calculate the correct episode number within that specific season
    const episodeOffset = absoluteEpisode - matchingRule.startAbs;
    const seasonEpisode = matchingRule.startEp + episodeOffset;

    return {
      season: matchingRule.season,
      episode: seasonEpisode
    };
  }
  
  /**
   * Dynamically fetches rules from TheXEM for a specific TVDB ID.
   * Merges it into the local cache.
   */
  async fetchTheXemMapping(tvdbId, malId) {
    try {
      const response = await fetch(`http://thexem.info/map/all?id=${tvdbId}&origin=tvdb`);
      if (!response.ok) return null;
      const parsed = await response.json();
      if (parsed.result === 'success' && parsed.data) {
          console.log(`[AnimeMapper] Fetched TheXEM mapping for TVDB ID ${tvdbId}`);
          return parsed.data;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

module.exports = AnimeMapper;
