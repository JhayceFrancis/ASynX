import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app, appSettings, libraryItems, webhookLogs, syncLogs } from '../../server';

describe('ASynX Comprehensive Integration Testing & Validation Suite', () => {
  const originalFetch = global.fetch;

  // Helper to obtain CSRF headers for mutating API endpoints
  async function getCsrfHeaders() {
    const res = await request(app).get('/api/csrf-token');
    const setCookie = res.headers['set-cookie'];
    return {
      'x-csrf-token': res.body.csrfToken as string,
      'Cookie': Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie || '')
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // Ensure a standard test item exists for webhook and scrobble resolution tests
    if (!libraryItems.some(i => i.id === 'test-item-validation-1')) {
      libraryItems.unshift({
        id: 'test-item-validation-1',
        title: "Frieren: Beyond Journey's End",
        mediaType: 'Anime TV Series',
        coverImage: 'https://example.com/frieren.jpg',
        year: 2023,
        genres: ['Fantasy', 'Adventure'],
        totalEpisodes: 28,
        hasConflict: true,
        conflictDetails: {
          type: 'progress_discrepancy',
          category: 'Progress Discrepancy',
          summary: 'Desync detected between Simkl and MAL',
          differences: [
            { platform: 'simkl', status: 'watching', episode: 5, updatedAt: new Date().toISOString() },
            { platform: 'mal', status: 'watching', episode: 4, updatedAt: new Date().toISOString() }
          ]
        },
        platforms: {
          simkl: { id: 'simkl-1', episode: 5, score: 9, status: 'watching', synced: true, updatedAt: new Date().toISOString() },
          mal: { id: 'mal-1', episode: 4, score: 9, status: 'watching', synced: false, updatedAt: new Date().toISOString() },
          anilist: { id: 'anilist-1', episode: 5, score: 90, status: 'watching', synced: true, updatedAt: new Date().toISOString() },
          karakeep: { id: 'kara-1', episode: 4, score: 0, status: 'watching', synced: false, updatedAt: new Date().toISOString() }
        }
      });
    }

    if (appSettings.remoteSync) {
      appSettings.remoteSync.enabled = false;
    }
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // =========================================================================
  // 1. SIMKL INTEGRATION
  // =========================================================================
  describe('1. Simkl Integration (Auth, Handshake, Scrobble & Data Processing)', () => {
    it('Auth: OAuth login endpoint generates authorization URL with clientId and scopes', async () => {
      appSettings.simkl.clientId = 'test_simkl_client_123';
      const res = await request(app).get('/api/auth/simkl/login');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('https://simkl.com/oauth/authorize');
      expect(res.headers.location).toContain('client_id=test_simkl_client_123');
      expect(res.headers.location).toContain('response_type=code');
    });

    it('Auth: OAuth callback exchanges authorization code for access token and updates state', async () => {
      appSettings.simkl.clientId = 'test_simkl_client_123';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'simkl_mock_token_abc',
          token_type: 'Bearer'
        })
      });

      const res = await request(app).get('/api/auth/simkl/callback?code=mock_code_xyz');
      expect(res.status).toBe(200);
      expect(appSettings.simkl.accessToken).toBe('simkl_mock_token_abc');
      expect(appSettings.simkl.connected).toBe(true);
    });

    it('Handshake: /api/integrations/test executes authorized settings probe for Simkl', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ user: { name: 'SimklUser' }, settings: {} })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'simkl',
          config: {
            clientId: 'simkl_client_test',
            accessToken: 'simkl_token_test'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.user.name).toBe('SimklUser');
      expect(res.body.request.url).toContain('api.simkl.com/users/settings');
    });

    it('Settings Handshake: /api/settings rejects invalid Simkl token with 401', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const headers = await getCsrfHeaders();
      const res = await request(app)
        .post('/api/settings')
        .set('Cookie', headers['Cookie'])
        .set('x-csrf-token', headers['x-csrf-token'])
        .send({
          simkl: {
            clientId: 'new_client_id',
            accessToken: 'invalid_simkl_token',
            connected: false
          }
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid Simkl API credentials');
    });

    it('Data Processing: Cross-platform scrobble updates Simkl progress', async () => {
      const targetItem = libraryItems[0];
      const initialEp = targetItem.platforms.simkl?.episode || 1;
      const targetEp = initialEp + 2;

      const res = await request(app)
        .post('/api/daemon/scrobble')
        .send({
          title: targetItem.title,
          episode: targetEp,
          platform: 'simkl'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(syncLogs[0].platformsAffected).toContain('simkl');
    });
  });

  // =========================================================================
  // 2. MYANIMELIST (MAL) INTEGRATION
  // =========================================================================
  describe('2. MyAnimeList (MAL) Integration (OAuth PKCE, Profile & Error Bubble)', () => {
    it('Auth: OAuth login generates PKCE challenge and state parameters', async () => {
      appSettings.mal.clientId = 'test_mal_client_pkce';
      const res = await request(app).get('/api/auth/mal/login');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('myanimelist.net/v1/oauth2/authorize');
      expect(res.headers.location).toContain('code_challenge=');
      expect(res.headers.location).toContain('code_challenge_method=plain');
      expect(res.headers.location).toContain('state=');
    });

    it('Auth: OAuth callback parses token and marks MAL connected', async () => {
      appSettings.mal.clientId = 'test_mal_client_pkce';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mal_token_123',
          refresh_token: 'mal_refresh_456',
          token_type: 'Bearer'
        })
      });

      const res = await request(app).get('/api/auth/mal/callback?code=valid_mal_code&state=test_state');
      expect(res.status).toBe(200);
      expect(appSettings.mal.accessToken).toBe('mal_token_123');
      expect(appSettings.mal.connected).toBe(true);
    });

    it('Handshake: /api/integrations/test executes MAL @me user profile probe', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 9876, name: 'OtakuMaster' })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'mal',
          config: {
            accessToken: 'mal_valid_token'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.name).toBe('OtakuMaster');
    });

    it('Settings Handshake: Populates MAL username and updates connected status on success', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 101, name: 'MalSyncPilot' })
      });

      const headers = await getCsrfHeaders();
      const res = await request(app)
        .post('/api/settings')
        .set('Cookie', headers['Cookie'])
        .set('x-csrf-token', headers['x-csrf-token'])
        .send({
          mal: {
            accessToken: 'mal_fresh_valid_token',
            connected: false
          }
        });

      expect(res.status).toBe(200);
      expect(appSettings.mal.username).toBe('MalSyncPilot');
      expect(appSettings.mal.connected).toBe(true);
    });
  });

  // =========================================================================
  // 3. ANILIST INTEGRATION
  // =========================================================================
  describe('3. AniList Integration (GraphQL Auth, Viewer Query & Mutation Validation)', () => {
    it('Auth: OAuth login generates AniList authorization URL', async () => {
      appSettings.anilist.clientId = 'anilist_test_id';
      const res = await request(app).get('/api/auth/anilist/login');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('anilist.co/api/v2/oauth/authorize');
      expect(res.headers.location).toContain('client_id=anilist_test_id');
    });

    it('Handshake: /api/integrations/test runs GraphQL query for Viewer', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          data: {
            Viewer: {
              id: 54321,
              name: 'AnimeVoyager',
              avatar: { medium: 'https://img.anilist.co/avatar.jpg' }
            }
          }
        })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'anilist',
          config: {
            accessToken: 'anilist_valid_token'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.data.Viewer.name).toBe('AnimeVoyager');
      expect(res.body.request.body.query).toContain('Viewer');
    });

    it('Settings Handshake: Rejects expired AniList token with 401', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const headers = await getCsrfHeaders();
      const res = await request(app)
        .post('/api/settings')
        .set('Cookie', headers['Cookie'])
        .set('x-csrf-token', headers['x-csrf-token'])
        .send({
          anilist: {
            accessToken: 'expired_anilist_token',
            connected: false
          }
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid AniList API credentials');
    });
  });

  // =========================================================================
  // 4. KARAKEEP INTEGRATION
  // =========================================================================
  describe('4. KaraKeep Integration (authKey Security, Webhook Ingest & Auto-Sync)', () => {
    it('Auth: Rejects webhook payload without authKey when apiKey is configured', async () => {
      appSettings.karakeep = {
        apiUrl: 'https://api.karakeep.com',
        apiKey: 'secure_karakeep_token_999',
        webhookUrl: '',
        connected: true
      };

      const unauthorizedRes = await request(app)
        .post('/api/webhooks/karakeep?authKey=invalid_key')
        .send({
          event: 'watched',
          anime_title: 'Frieren: Beyond Journey\'s End',
          season: 1,
          episode: 12
        });

      expect(unauthorizedRes.status).toBe(401);
      expect(unauthorizedRes.body.success).toBe(false);
      expect(unauthorizedRes.body.error).toContain('Unauthorized');
    });

    it('Data Processing: Ingests valid KaraKeep webhook, advances episode, and resolves conflicts', async () => {
      appSettings.karakeep = {
        apiUrl: 'https://api.karakeep.com',
        apiKey: 'secure_karakeep_token_999',
        webhookUrl: '',
        connected: true
      };

      const matchedItem = libraryItems[0];
      const newEpisode = 15;

      const successRes = await request(app)
        .post('/api/webhooks/karakeep?authKey=secure_karakeep_token_999')
        .send({
          event: 'watched',
          anime_title: matchedItem.title,
          season: 1,
          episode: newEpisode
        });

      expect(successRes.status).toBe(200);
      expect(successRes.body.status).toBe('ok');
      expect(matchedItem.platforms.karakeep?.episode).toBe(newEpisode);
      expect(matchedItem.hasConflict).toBe(false);

      // Verify webhook audit log
      const recentLog = webhookLogs.find(l => l.source === 'karakeep');
      expect(recentLog).toBeDefined();
      expect(recentLog?.index).toBe(newEpisode);
    });

    it('Handshake: /api/integrations/test verifies KaraKeep /api/v1/status endpoint', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'healthy', version: '1.4.0' })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'karakeep',
          config: {
            apiUrl: 'https://custom-karakeep.local',
            apiKey: 'key_123'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.status).toBe('healthy');
      expect(appSettings.karakeep.connected).toBe(true);
    });
  });

  // =========================================================================
  // 5. PLEX MEDIA SERVER INTEGRATION
  // =========================================================================
  describe('5. Plex Media Server (Token Auth, Identity Probe & Scrobble Matching)', () => {
    it('Handshake: Validates Plex connection using X-Plex-Token header and /identity', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/xml' }),
        text: async () => '<MediaContainer size="1" machineIdentifier="plex-server-id"/>'
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'plex',
          config: {
            serverUrl: 'http://192.168.1.150:32400',
            token: 'plex_secret_token'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.request.url).toContain('/identity');
      expect(res.body.request.headers['X-Plex-Token']).toBeDefined();
    });

    it('Data Processing: Ingests Plex multipart/form-data stringified scrobble payload', async () => {
      const matched = libraryItems[0];
      const scrobbleEp = 8;

      const plexPayload = {
        event: 'media.scrobble',
        Account: { title: 'PlexAdmin' },
        Player: { title: 'Plex for Windows' },
        Metadata: {
          type: 'episode',
          grandparentTitle: matched.title,
          title: 'A Critical Turning Point',
          parentIndex: 1,
          index: scrobbleEp
        }
      };

      const res = await request(app)
        .post('/api/webhooks/plex')
        .send({
          payload: JSON.stringify(plexPayload)
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(matched.platforms.simkl?.episode).toBeGreaterThanOrEqual(scrobbleEp);
      expect(matched.plexMatch).toBeDefined();
      expect(matched.plexMatch?.lastScrobbledAt).toBeDefined();
    });
  });

  // =========================================================================
  // 6. JELLYFIN MEDIA SERVER INTEGRATION
  // =========================================================================
  describe('6. Jellyfin Integration (X-Emby-Token, PlaybackStop Ingest & Auto-Sync Log)', () => {
    it('Handshake: Tests Jellyfin public endpoint with API key', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ServerName: 'JellyfinHome', Version: '10.9.0' })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'jellyfin',
          config: {
            serverUrl: 'http://192.168.1.200:8096',
            apiKey: 'jf_api_key_abc'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.ServerName).toBe('JellyfinHome');
      expect(res.body.request.headers['X-Emby-Token']).toBeDefined();
    });

    it('Data Processing: Ingests Jellyfin PlaybackStop webhook and advances anime progress', async () => {
      const item = libraryItems[0];
      const ep = 9;

      const res = await request(app)
        .post('/api/webhooks/jellyfin')
        .send({
          NotificationType: 'PlaybackStop',
          SeriesName: item.title,
          SeasonNumber: 1,
          EpisodeNumber: ep,
          UserId: 'user_jf_42',
          Client: 'Jellyfin Web'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Jellyfin webhook received');
      expect(item.platforms.simkl?.episode).toBeGreaterThanOrEqual(ep);
    });

    it('Data Processing: Ignores non-PlaybackStop notifications gracefully', async () => {
      const res = await request(app)
        .post('/api/webhooks/jellyfin')
        .send({
          NotificationType: 'PlaybackProgress',
          SeriesName: 'Some Series'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Ignored event type.');
    });
  });

  // =========================================================================
  // 7. EMBY MEDIA SERVER INTEGRATION
  // =========================================================================
  describe('7. Emby Integration (Token Auth & playback.scrobble Ingest)', () => {
    it('Handshake: Tests Emby system info handshake', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ServerName: 'EmbyCinema', Version: '4.8.0.0' })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'emby',
          config: {
            serverUrl: 'http://192.168.1.205:8096',
            apiKey: 'emby_token_xyz'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.ServerName).toBe('EmbyCinema');
    });

    it('Data Processing: Parses Emby webhook payload and synchronizes episode marker', async () => {
      const item = libraryItems[0];
      const ep = 10;

      const res = await request(app)
        .post('/api/webhooks/emby')
        .send({
          Event: 'playback.scrobble',
          Item: {
            SeriesName: item.title,
            ParentIndexNumber: 1,
            IndexNumber: ep
          },
          User: { Name: 'EmbyMaster' },
          Session: { Client: 'Emby Theater' }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(item.platforms.simkl?.episode).toBeGreaterThanOrEqual(ep);
    });
  });

  // =========================================================================
  // 8. TAUTULLI INTEGRATION
  // =========================================================================
  describe('8. Tautulli Integration (API Key Handshake & Notification Ingest)', () => {
    it('Handshake: Tests Tautulli /api/v2 endpoint with apikey parameter', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ response: { result: 'success', data: { version: 'v2.14.0' } } })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'tautulli',
          config: {
            serverUrl: 'http://192.168.1.180:8181',
            apiKey: 'tautulli_api_key_pass'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.request.url).toContain('/api/v2?cmd=status');
    });

    it('Data Processing: Ingests Tautulli watch notification and logs sync transaction', async () => {
      const item = libraryItems[0];
      const ep = 11;

      const res = await request(app)
        .post('/api/webhooks/tautulli')
        .send({
          show_name: item.title,
          season_num: 1,
          episode_num: ep,
          user: 'TautulliTester',
          player: 'Nvidia Shield'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Tautulli webhook received');
      expect(item.platforms.simkl?.episode).toBeGreaterThanOrEqual(ep);

      const recentSyncLog = syncLogs.find(l => l.source === 'tautulli_webhook');
      expect(recentSyncLog).toBeDefined();
    });
  });

  // =========================================================================
  // 9. MEILISEARCH & LOCAL AI (LLAMA) INTEGRATIONS
  // =========================================================================
  describe('9. MeiliSearch & Local AI (Llama) Integration Probing', () => {
    it('Handshake: Tests MeiliSearch /health with Bearer API key', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'available' })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'meilisearch',
          config: {
            hostUrl: 'http://localhost:7700',
            apiKey: 'meili_master_key'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response.status).toBe('available');
    });

    it('Handshake: Tests Llama AI endpoint probe with authorization', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ models: [{ name: 'llama3.2:latest' }] })
      });

      const res = await request(app)
        .post('/api/integrations/test')
        .send({
          provider: 'llamaAI',
          config: {
            endpointUrl: 'http://localhost:11434',
            apiKey: 'llama_test_token'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.request.url).toContain('/api/tags');
    });
  });

  // =========================================================================
  // 10. BROWSER EXTENSION INGEST & HEALTH PING
  // =========================================================================
  describe('10. Browser Extension Ingest & Service Health Ping', () => {
    it('Ingest: Validates stateless browser extension ingest payload', async () => {
      const res = await request(app)
        .post('/api/ingest')
        .send({
          title: 'Solo Leveling Season 2',
          season: 2,
          episode: 4,
          action: 'watching'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ingested).toBe(true);
    });

    it('Ingest: Enforces Bearer API Key when remoteSync is enabled', async () => {
      appSettings.remoteSync = {
        enabled: true,
        serverUrl: 'http://localhost:3000',
        apiKey: 'secure_hub_token_xyz',
        lastSync: undefined
      };

      // Request without auth header fails
      const unauthRes = await request(app)
        .post('/api/ingest')
        .send({
          title: 'Solo Leveling Season 2',
          season: 2,
          episode: 4
        });
      expect(unauthRes.status).toBe(401);

      // Request with matching Bearer token succeeds
      const authRes = await request(app)
        .post('/api/ingest')
        .set('Authorization', 'Bearer secure_hub_token_xyz')
        .send({
          title: 'Solo Leveling Season 2',
          season: 2,
          episode: 4
        });
      expect(authRes.status).toBe(200);
      expect(authRes.body.success).toBe(true);

      appSettings.remoteSync.enabled = false;
    });

    it('Health: /api/webhooks/health/ping reports status for all media services', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200
      });

      const res = await request(app)
        .post('/api/webhooks/health/ping')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.plex).toBeDefined();
      expect(res.body.tautulli).toBeDefined();
      expect(res.body.jellyfin).toBeDefined();
      expect(res.body.emby).toBeDefined();
      expect(res.body.karakeep).toBeDefined();
    });
  });
});
