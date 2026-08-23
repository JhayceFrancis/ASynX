import { AppSettings } from '../types';

export class OAuthService {
  /**
   * Initiates the OAuth flow for the given provider by opening a popup window
   * pointing to the backend login route.
   */
  static initiateLogin(provider: string): void {
    const width = 600;
    const height = 700;
    const left = window.innerWidth / 2 - width / 2 + window.screenX;
    const top = window.innerHeight / 2 - height / 2 + window.screenY;

    const authWindow = window.open(
      `/api/auth/${provider}/login`,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!authWindow) {
      alert('Please allow popups for this site to connect your account.');
    }
  }

  /**
   * Processes the incoming OAuth message and generates the updated settings payload.
   */
  static processAuthMessage(
    event: MessageEvent, 
    currentSettings: AppSettings
  ): AppSettings | null {
    const origin = event.origin;
    if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
      return null;
    }

    if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
      const { provider, token } = event.data;
      const updated = { ...currentSettings };
      
      if (provider === 'simkl') {
        updated.simkl = { ...updated.simkl, accessToken: token, connected: true };
      } else if (provider === 'mal') {
        updated.mal = { ...updated.mal, accessToken: token, connected: true };
      } else if (provider === 'anilist') {
        updated.anilist = { ...updated.anilist, accessToken: token, connected: true };
      }
      return updated;
    }
    
    return null;
  }
}
