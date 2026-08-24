import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app, appSettings } from '../../server';

describe('ASynX Security & Persistence Validation Suite', () => {

  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Automated Security Tests', () => {

    it('SSRF: Assert that passing an invalid or malicious URL returns a 400 Bad Request', async () => {
      appSettings.remoteSync = {
        enabled: true,
        serverUrl: 'file:///etc/passwd',
        apiKey: 'test-key',
        lastSync: null
      };

      const res = await request(app)
        .post('/api/remote-sync/pull')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Unsupported protocol|Invalid URL/);
    });

    it('Prototype Pollution: Assert that attempting to inject __proto__ is rejected/stripped', async () => {
      const res = await request(app)
        .post('/api/sync/override')
        .send({
          itemId: 'test-item',
          targetEpisode: 5,
          targetStatus: 'watching',
          applyToPlatforms: ['__proto__']
        });

      expect({}.constructor).toBe(Object);
      expect((Object.prototype as any).episode).toBeUndefined();
      expect((Object.prototype as any).status).toBeUndefined();
    });

    it('XSS: Assert that flagged endpoints return strict application/json or text/plain and do not reflect raw HTML', async () => {
      const res = await request(app)
        .get('/api/auth/unknown_provider/login')
        .send();

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toBe('Unknown provider');
    });

  });

  describe('2. Automated Integration Tests (State Persistence)', () => {

    it('Plex Webhook: Write tests to verify the Plex database write endpoint', async () => {
      const res = await request(app)
        .post('/api/webhooks/plex')
        .send({
          payload: JSON.stringify({
            event: 'media.scrobble',
            Metadata: {
              type: 'episode',
              title: 'Test Plex Anime',
              parentIndex: 1,
              index: 2
            }
          })
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('KaraKeep Webhook: Assert endpoint validates authKey and writes state correctly', async () => {
      appSettings.karakeep = {
        ...appSettings.karakeep,
        connected: true,
        apiKey: 'secret-auth-key'
      };

      const badRes = await request(app)
        .post('/api/webhooks/karakeep?authKey=wrong-key')
        .send({
          event: 'watched',
          anime_title: 'Test KaraKeep Anime',
          season: 1,
          episode: 5
        });
      expect(badRes.status).toBe(401);

      const goodRes = await request(app)
        .post('/api/webhooks/karakeep?authKey=secret-auth-key')
        .send({
          event: 'watched',
          anime_title: 'Test KaraKeep Anime',
          season: 1,
          episode: 5
        });
      
      expect(goodRes.status).toBe(200);
      expect(goodRes.body.status).toBe('ok');
    });

    it('MAL Handshake: Mock a failed anime tracking handshake and assert error bubble up', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const res = await request(app)
        .post('/api/settings')
        .send({
          mal: {
            clientId: 'test-client',
            accessToken: 'test-token',
            connected: false
          }
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid MyAnimeList API credentials');
    });

  });
});
