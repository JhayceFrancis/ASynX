const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// Add watchlist mapping to syncRules
const syncRulesOld = `    excludedTitles?: string[];
    scheduledRules?: Array<{
      id: string;
      source: string;
      target: string;
      time: string;
      enabled: boolean;
    }>;
  };`;
const syncRulesNew = `    excludedTitles?: string[];
    scheduledRules?: Array<{
      id: string;
      source: string;
      target: string;
      time: string;
      enabled: boolean;
    }>;
    watchlistDestination?: PlatformType | 'local' | 'custom';
    customWatchlistMapping?: {
      anime?: PlatformType | 'local';
      animeTV?: PlatformType | 'local';
      animeFilms?: PlatformType | 'local';
      drama?: PlatformType | 'local';
      TVSeries?: PlatformType | 'local';
      films?: PlatformType | 'local';
      Bookmarks?: PlatformType | 'local';
      localMedia?: PlatformType | 'local';
    };
  };`;

if(code.includes(syncRulesOld)) {
    code = code.replace(syncRulesOld, syncRulesNew);
    fs.writeFileSync('src/types.ts', code);
    console.log("Types patched");
} else {
    console.log("Types already patched or not matched");
}
