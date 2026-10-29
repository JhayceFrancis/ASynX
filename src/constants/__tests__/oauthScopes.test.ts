import { describe, expect, it } from 'vitest';
import {
  getDefaultScopes,
  getLeastPrivilegeScopes,
  getAllScopes,
  isLeastPrivilege,
  OAUTH_SCOPES_CONFIG
} from '../oauthScopes';

describe('OAuth Scopes Constants', () => {
  describe('getDefaultScopes', () => {
    it('should return default scopes for simkl', () => {
      const scopes = getDefaultScopes('simkl');
      expect(scopes).toEqual(OAUTH_SCOPES_CONFIG.simkl.defaultScopes);
      expect(scopes).toContain('history');
      expect(scopes).toContain('watchlist');
    });

    it('should return default scopes for mal', () => {
      const scopes = getDefaultScopes('mal');
      expect(scopes).toEqual(OAUTH_SCOPES_CONFIG.mal.defaultScopes);
      expect(scopes).toContain('read:users');
      expect(scopes).toContain('write:users');
    });

    it('should return default scopes for anilist', () => {
      const scopes = getDefaultScopes('anilist');
      expect(scopes).toEqual(OAUTH_SCOPES_CONFIG.anilist.defaultScopes);
      expect(scopes).toContain('media:read');
      expect(scopes).toContain('media:write');
    });

    it('should return empty array for an unknown provider (edge case)', () => {
      // TypeScript compiler complains about invalid provider types, so we cast it for testing
      const scopes = getDefaultScopes('unknown' as 'simkl');
      expect(scopes).toEqual([]);
    });
  });

  describe('getLeastPrivilegeScopes', () => {
    it('should return least privilege scopes for simkl', () => {
      const scopes = getLeastPrivilegeScopes('simkl');
      expect(scopes).toEqual(OAUTH_SCOPES_CONFIG.simkl.leastPrivilegeScopes);
    });

    it('should return least privilege scopes for mal', () => {
      const scopes = getLeastPrivilegeScopes('mal');
      expect(scopes).toEqual(OAUTH_SCOPES_CONFIG.mal.leastPrivilegeScopes);
    });

    it('should return least privilege scopes for anilist', () => {
      const scopes = getLeastPrivilegeScopes('anilist');
      expect(scopes).toEqual(OAUTH_SCOPES_CONFIG.anilist.leastPrivilegeScopes);
    });

    it('should return empty array for an unknown provider (edge case)', () => {
      const scopes = getLeastPrivilegeScopes('unknown' as 'simkl');
      expect(scopes).toEqual([]);
    });
  });

  describe('getAllScopes', () => {
    it('should return all available scopes for simkl', () => {
      const scopes = getAllScopes('simkl');
      const allSimklScopeIds = OAUTH_SCOPES_CONFIG.simkl.scopes.map(s => s.id);
      expect(scopes).toEqual(allSimklScopeIds);
    });

    it('should return all available scopes for mal', () => {
      const scopes = getAllScopes('mal');
      const allMalScopeIds = OAUTH_SCOPES_CONFIG.mal.scopes.map(s => s.id);
      expect(scopes).toEqual(allMalScopeIds);
    });

    it('should return all available scopes for anilist', () => {
      const scopes = getAllScopes('anilist');
      const allAnilistScopeIds = OAUTH_SCOPES_CONFIG.anilist.scopes.map(s => s.id);
      expect(scopes).toEqual(allAnilistScopeIds);
    });

    it('should return empty array for an unknown provider (edge case)', () => {
      const scopes = getAllScopes('unknown' as 'simkl');
      expect(scopes).toEqual([]);
    });
  });

  describe('isLeastPrivilege', () => {
    it('should return true if no scopes are provided (empty array)', () => {
      expect(isLeastPrivilege('simkl', [])).toBe(true);
      expect(isLeastPrivilege('mal', [])).toBe(true);
      expect(isLeastPrivilege('anilist', [])).toBe(true);
    });

    it('should return true if undefined is passed for selectedScopes', () => {
      // Type casting needed for testing invalid inputs
      expect(isLeastPrivilege('simkl', undefined as unknown as string[])).toBe(true);
    });

    it('should return true if only least privilege scopes are selected (simkl)', () => {
      const leastPrivilegeScopes = OAUTH_SCOPES_CONFIG.simkl.leastPrivilegeScopes;
      expect(isLeastPrivilege('simkl', leastPrivilegeScopes)).toBe(true);

      // Subset should also be true
      expect(isLeastPrivilege('simkl', [leastPrivilegeScopes[0]])).toBe(true);
    });

    it('should return false if any non-least privilege scopes are selected (simkl)', () => {
      const leastPrivilegeScopes = OAUTH_SCOPES_CONFIG.simkl.leastPrivilegeScopes;

      // An optional/elevated scope
      expect(isLeastPrivilege('simkl', ['profile'])).toBe(false);

      // Mix of least privilege and elevated
      expect(isLeastPrivilege('simkl', [...leastPrivilegeScopes, 'checkin'])).toBe(false);
    });

    it('should return true if only least privilege scopes are selected (mal)', () => {
      const leastPrivilegeScopes = OAUTH_SCOPES_CONFIG.mal.leastPrivilegeScopes;
      expect(isLeastPrivilege('mal', leastPrivilegeScopes)).toBe(true);
    });

    it('should return false if a non-existent scope is passed', () => {
      expect(isLeastPrivilege('simkl', ['non_existent_scope'])).toBe(false);
    });

    it('should handle unknown provider safely', () => {
      // An unknown provider will have [] as least privilege scopes.
      // So any non-empty selected scope array will return false, but empty returns true.
      expect(isLeastPrivilege('unknown' as 'simkl', ['any_scope'])).toBe(false);
      expect(isLeastPrivilege('unknown' as 'simkl', [])).toBe(true);
    });
  });

  describe('OAUTH_SCOPES_CONFIG validation', () => {
    it('should correctly configure Simkl scopes', () => {
      const config = OAUTH_SCOPES_CONFIG.simkl;
      expect(config.provider).toBe('simkl');
      expect(config.defaultScopes.length).toBeGreaterThan(0);

      // Validate that all default scopes actually exist in the scopes array
      const allScopeIds = config.scopes.map(s => s.id);
      config.defaultScopes.forEach(scope => {
        expect(allScopeIds).toContain(scope);
      });

      // Validate recommendedForLeastPrivilege flag matches leastPrivilegeScopes array
      const scopesMarkedLeast = config.scopes.filter(s => s.recommendedForLeastPrivilege).map(s => s.id);
      expect(scopesMarkedLeast.sort()).toEqual([...config.leastPrivilegeScopes].sort());
    });

    it('should correctly configure MyAnimeList scopes', () => {
      const config = OAUTH_SCOPES_CONFIG.mal;
      expect(config.provider).toBe('mal');

      // Validate recommendedForLeastPrivilege flag matches leastPrivilegeScopes array
      const scopesMarkedLeast = config.scopes.filter(s => s.recommendedForLeastPrivilege).map(s => s.id);
      expect(scopesMarkedLeast.sort()).toEqual([...config.leastPrivilegeScopes].sort());
    });

    it('should correctly configure AniList scopes', () => {
      const config = OAUTH_SCOPES_CONFIG.anilist;
      expect(config.provider).toBe('anilist');

      // Validate recommendedForLeastPrivilege flag matches leastPrivilegeScopes array
      const scopesMarkedLeast = config.scopes.filter(s => s.recommendedForLeastPrivilege).map(s => s.id);
      expect(scopesMarkedLeast.sort()).toEqual([...config.leastPrivilegeScopes].sort());
    });
  });
});
