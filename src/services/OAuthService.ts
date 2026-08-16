import { AppSettings } from '../types';

export class OAuthService {
  /**
   * Initiates the OAuth flow for the given provider by fetching the Auth URL
   * and opening a popup window.
   */
  static async initiateLogin(provider: string): Promise<void> {
    try {
      const response = await fetch(`/api/auth/${provider}/url`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );
      
      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth initiation error:', error);
      alert('OAuth integration is currently unavailable.');
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
