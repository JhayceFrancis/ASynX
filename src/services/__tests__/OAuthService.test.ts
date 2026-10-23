// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OAuthService } from '../OAuthService';
import { AppSettings } from '../../types';

describe('OAuthService', () => {
  describe('initiateLogin', () => {
    let windowOpenSpy: any;
    let windowAlertSpy: any;

    beforeEach(() => {
      windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => ({} as Window));
      windowAlertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      // Mock window properties
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
      Object.defineProperty(window, 'screenX', { value: 0, writable: true });
      Object.defineProperty(window, 'screenY', { value: 0, writable: true });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should open a popup with correct url and dimensions', () => {
      OAuthService.initiateLogin('simkl');

      const expectedWidth = 600;
      const expectedHeight = 700;
      const expectedLeft = 1024 / 2 - expectedWidth / 2 + 0;
      const expectedTop = 768 / 2 - expectedHeight / 2 + 0;

      expect(windowOpenSpy).toHaveBeenCalledWith(
        '/api/auth/simkl/login',
        'oauth_popup',
        `width=${expectedWidth},height=${expectedHeight},left=${expectedLeft},top=${expectedTop}`
      );
    });

    it('should alert if popup is blocked', () => {
      windowOpenSpy.mockImplementation(() => null);

      OAuthService.initiateLogin('simkl');

      expect(windowAlertSpy).toHaveBeenCalledWith('Please allow popups for this site to connect your account.');
    });
  });

  describe('processAuthMessage', () => {
    const mockSettings = {
      simkl: { connected: false, accessToken: '', clientId: 'client_123' },
      mal: { connected: false, accessToken: '', clientId: 'client_456' },
      anilist: { connected: false, accessToken: '', clientId: 'client_789' }
    } as unknown as AppSettings;

    it('should return null for invalid origin', () => {
      const event = new MessageEvent('message', {
        origin: 'https://malicious-site.com',
        data: { type: 'OAUTH_AUTH_SUCCESS', provider: 'simkl', token: 'token123' }
      });

      const result = OAuthService.processAuthMessage(event, mockSettings);
      expect(result).toBeNull();
    });

    it('should return null for invalid message type', () => {
      const event = new MessageEvent('message', {
        origin: 'http://localhost:3000',
        data: { type: 'UNKNOWN_TYPE', provider: 'simkl', token: 'token123' }
      });

      const result = OAuthService.processAuthMessage(event, mockSettings);
      expect(result).toBeNull();
    });

    it('should update simkl settings correctly', () => {
      const event = new MessageEvent('message', {
        origin: 'https://app-name.run.app',
        data: { type: 'OAUTH_AUTH_SUCCESS', provider: 'simkl', token: 'simkl-token' }
      });

      const result = OAuthService.processAuthMessage(event, mockSettings);

      expect(result).not.toBeNull();
      expect(result?.simkl.accessToken).toBe('simkl-token');
      expect(result?.simkl.connected).toBe(true);
      // Verify other settings weren't mutated
      expect(result?.mal.connected).toBe(false);
    });

    it('should update mal settings correctly', () => {
      const event = new MessageEvent('message', {
        origin: 'http://localhost:5173',
        data: { type: 'OAUTH_AUTH_SUCCESS', provider: 'mal', token: 'mal-token' }
      });

      const result = OAuthService.processAuthMessage(event, mockSettings);

      expect(result).not.toBeNull();
      expect(result?.mal.accessToken).toBe('mal-token');
      expect(result?.mal.connected).toBe(true);
    });

    it('should update anilist settings correctly', () => {
      const event = new MessageEvent('message', {
        origin: 'http://localhost:8080',
        data: { type: 'OAUTH_AUTH_SUCCESS', provider: 'anilist', token: 'anilist-token' }
      });

      const result = OAuthService.processAuthMessage(event, mockSettings);

      expect(result).not.toBeNull();
      expect(result?.anilist.accessToken).toBe('anilist-token');
      expect(result?.anilist.connected).toBe(true);
    });

    it('should ignore valid messages without matching provider', () => {
      const event = new MessageEvent('message', {
        origin: 'http://localhost:8080',
        data: { type: 'OAUTH_AUTH_SUCCESS', provider: 'unknown', token: 'unknown-token' }
      });

      const result = OAuthService.processAuthMessage(event, mockSettings);

      // According to implementation, it returns `updated` but no provider data is mutated
      expect(result).toEqual(mockSettings);
    });
  });
});
