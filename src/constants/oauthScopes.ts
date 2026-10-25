export interface OAuthScopeDefinition {
  id: string;
  label: string;
  description: string;
  recommendedForLeastPrivilege: boolean;
  level: 'essential' | 'optional' | 'elevated';
}

export interface ProviderScopeConfig {
  provider: 'simkl' | 'mal' | 'anilist';
  label: string;
  defaultScopes: string[];
  leastPrivilegeScopes: string[];
  scopes: OAuthScopeDefinition[];
}

export const OAUTH_SCOPES_CONFIG: Record<'simkl' | 'mal' | 'anilist', ProviderScopeConfig> = {
  simkl: {
    provider: 'simkl',
    label: 'Simkl',
    defaultScopes: ['history', 'watchlist'],
    leastPrivilegeScopes: ['history', 'watchlist'],
    scopes: [
      {
        id: 'history',
        label: 'Watch History & Scrobbling',
        description: 'Sync episode completions, watch timestamps, and playback progress.',
        recommendedForLeastPrivilege: true,
        level: 'essential'
      },
      {
        id: 'watchlist',
        label: 'Watchlist Management',
        description: 'Read and update Plan to Watch, Watching, Completed, and Dropped lists.',
        recommendedForLeastPrivilege: true,
        level: 'essential'
      },
      {
        id: 'ratings',
        label: 'Ratings & Reviews',
        description: 'Read and write user anime/show ratings, scores, and personal review notes.',
        recommendedForLeastPrivilege: false,
        level: 'optional'
      },
      {
        id: 'checkin',
        label: 'Live Playback Check-ins',
        description: 'Broadcast active playback state in real-time to your Simkl profile.',
        recommendedForLeastPrivilege: false,
        level: 'optional'
      },
      {
        id: 'profile',
        label: 'User Profile & Preferences',
        description: 'Read account profile details, avatars, and private account preferences.',
        recommendedForLeastPrivilege: false,
        level: 'elevated'
      }
    ]
  },
  mal: {
    provider: 'mal',
    label: 'MyAnimeList',
    defaultScopes: ['read:users', 'write:users'],
    leastPrivilegeScopes: ['read:users', 'write:users'],
    scopes: [
      {
        id: 'read:users',
        label: 'Read User Anime & Profile',
        description: 'Fetch current anime/manga lists, watch progress, and user profile data.',
        recommendedForLeastPrivilege: true,
        level: 'essential'
      },
      {
        id: 'write:users',
        label: 'Modify Anime List & Progress',
        description: 'Update episode counters, scores, start/finish dates, and watch status.',
        recommendedForLeastPrivilege: true,
        level: 'essential'
      }
    ]
  },
  anilist: {
    provider: 'anilist',
    label: 'AniList',
    defaultScopes: ['media:read', 'media:write'],
    leastPrivilegeScopes: ['media:read', 'media:write'],
    scopes: [
      {
        id: 'media:read',
        label: 'Read Media Lists',
        description: 'Read user anime and manga tracking lists, progress, and custom entries.',
        recommendedForLeastPrivilege: true,
        level: 'essential'
      },
      {
        id: 'media:write',
        label: 'Update Media Progress',
        description: 'Modify episode counts, scores, repeat counts, and watch status.',
        recommendedForLeastPrivilege: true,
        level: 'essential'
      },
      {
        id: 'user:profile',
        label: 'User Profile & Statistics',
        description: 'Access public profile details, user stats, and preferences.',
        recommendedForLeastPrivilege: false,
        level: 'optional'
      },
      {
        id: 'social:write',
        label: 'Social & Feed Activity',
        description: 'Publish scrobble events and updates to the AniList public activity feed.',
        recommendedForLeastPrivilege: false,
        level: 'elevated'
      }
    ]
  }
};

export function getDefaultScopes(provider: 'simkl' | 'mal' | 'anilist'): string[] {
  return OAUTH_SCOPES_CONFIG[provider]?.defaultScopes || [];
}

export function getLeastPrivilegeScopes(provider: 'simkl' | 'mal' | 'anilist'): string[] {
  return OAUTH_SCOPES_CONFIG[provider]?.leastPrivilegeScopes || [];
}

export function getAllScopes(provider: 'simkl' | 'mal' | 'anilist'): string[] {
  return OAUTH_SCOPES_CONFIG[provider]?.scopes.map(s => s.id) || [];
}

export function isLeastPrivilege(provider: 'simkl' | 'mal' | 'anilist', selectedScopes: string[]): boolean {
  const least = getLeastPrivilegeScopes(provider);
  // It is least-privilege if all selected scopes belong to the least-privilege set
  if (!selectedScopes || selectedScopes.length === 0) return true;
  return selectedScopes.every(s => least.includes(s));
}
