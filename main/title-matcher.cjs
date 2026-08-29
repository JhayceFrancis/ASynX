class AnimeTitleMatcher {
  constructor() {
    this.titleCache = new Map();
  }

  async getMalId(parsedTitle) {
    if (!parsedTitle) return null;

    // Release groups often include season number, e.g. "Boku no Hero Academia Season 6"
    // To grab the parent series, we might optionally strip "Season X", but Anilist is good with fuzzy search.
    // Let's strip brackets just in case.
    let cleanTitle = parsedTitle.trim().toLowerCase().replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '');

    if (this.titleCache.has(cleanTitle)) {
      return this.titleCache.get(cleanTitle);
    }

    const query = `
      query ($search: String) {
        Media (search: $search, type: ANIME) {
          idMal
          title {
            romaji
            english
          }
        }
      }
    `;

    const variables = { search: cleanTitle };

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const mediaData = data?.data?.Media;
      const idMal = mediaData?.idMal;

      if (idMal) {
        this.titleCache.set(cleanTitle, idMal);
        return idMal;
      }

      return null;
    } catch (error) {
      if (error.name !== 'TimeoutError' && error.name !== 'AbortError') {
         console.error('[TitleMatcher] AniList fetch error:', error.message);
      }
      return null;
    }
  }
}

module.exports = AnimeTitleMatcher;
