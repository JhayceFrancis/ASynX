export interface ScrobblePayload {
  timestamp: string;
  title: string;
  absoluteEpisode?: number | string;
  season?: number | string;
  episode?: number | string;
  action: 'playing' | 'paused' | 'stopped' | 'completed';
}

export interface BookmarkRecord extends ScrobblePayload {
  synced_to_hub: boolean;
}
