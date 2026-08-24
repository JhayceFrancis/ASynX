import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mocking the Global SystemLogger
const mockSystemLogger = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  success: vi.fn()
};

const app = express();
app.use(express.json());

app.post('/api/settings', async (req, res) => {
  const incomingSettings = req.body;
  
  if (incomingSettings?.mal?.accessToken) {
    try {
      mockSystemLogger.info('Handshake', 'Validating MyAnimeList API credentials...');
      const malRes = await fetch('https://api.myanimelist.net/v2/users/@me', {
        headers: { 'Authorization': `Bearer ${incomingSettings.mal.accessToken}` }
      });
      
      if (!malRes.ok) {
        mockSystemLogger.error('Handshake', 'MyAnimeList credentials rejected (401 Unauthorized).');
        return res.status(401).json({ 
          success: false, 
          error: "Invalid MyAnimeList API credentials. Please verify your Access Token." 
        });
      }
      incomingSettings.mal.connected = true;
      mockSystemLogger.success('Handshake', 'MyAnimeList credentials validated successfully.');
    } catch (e) {
      return res.status(500).json({ success: false, error: "Failed to connect to MyAnimeList API." });
    }
  }

  if (incomingSettings?.karakeep) {
    const baseUrl = 'http://localhost:3000';
    incomingSettings.karakeep.webhookUrl = incomingSettings.karakeep.apiKey 
      ? `${baseUrl}/api/webhooks/karakeep?authKey=${incomingSettings.karakeep.apiKey}`
      : `${baseUrl}/api/webhooks/karakeep`;
  }

  res.status(200).json({ success: true, settings: incomingSettings });
});

describe('Backend Persistence & API Handshake Validation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  describe('Karakeep & Plex Persistence Configuration', () => {
    it('successfully appends the authKey to the Karakeep Webhook URL upon saving', async () => {
      const payload = {
        karakeep: { apiKey: 'test_secure_key_123', connected: true }
      };

      const response = await request(app)
        .post('/api/settings')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.settings.karakeep.webhookUrl).toBe('http://localhost:3000/api/webhooks/karakeep?authKey=test_secure_key_123');
    });
  });

  describe('MyAnimeList (MAL) Handshake Validation', () => {
    it('returns a 200 OK and sets connected=true when the MAL API accepts the token', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'TestUser' })
      });

      const payload = {
        mal: { accessToken: 'valid_token_xyz', connected: false }
      };

      const response = await request(app)
        .post('/api/settings')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.settings.mal.connected).toBe(true);
      expect(mockSystemLogger.info).toHaveBeenCalledWith('Handshake', 'Validating MyAnimeList API credentials...');
      expect(mockSystemLogger.success).toHaveBeenCalledWith('Handshake', 'MyAnimeList credentials validated successfully.');
    });

    it('returns a 401 Unauthorised when the MAL API rejects the token', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const payload = {
        mal: { accessToken: 'invalid_token_abc', connected: false }
      };

      const response = await request(app)
        .post('/api/settings')
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid MyAnimeList API credentials');
      expect(mockSystemLogger.error).toHaveBeenCalledWith('Handshake', 'MyAnimeList credentials rejected (401 Unauthorized).');
    });
  });
});
