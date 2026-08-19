const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `class PlaybackSessionManager {
  private sessions: Map<string, { lastReport: number, timeout: NodeJS.Timeout }> = new Map();

  public handleHeartbeat(payload: any) {
    const { mediaId, episodeNumber, title, player, mediaType, totalEpisodes } = payload;
    const sessionKey = \`\${mediaId || title}_\${episodeNumber}\`;

    const now = Date.now();
    const existing = this.sessions.get(sessionKey);

    if (existing) {
      clearTimeout(existing.timeout);
    }

    this.sessions.set(sessionKey, {
      lastReport: now,
      timeout: setTimeout(() => {
        this.commitSession(payload);
        this.sessions.delete(sessionKey);
      }, 120000) // 2 minutes debounce
    });`;

const replacement = `class PlaybackSessionManager {
  private sessions: Map<string, { lastReport: number, payload: any, timeout: NodeJS.Timeout }> = new Map();

  public handleHeartbeat(payload: any) {
    const { mediaId, episodeNumber, title, player, progressTimestamp } = payload;
    const sessionKey = \`\${mediaId || title}_\${episodeNumber}\`;
    const now = Date.now();
    let existing = this.sessions.get(sessionKey);

    if (existing) {
      clearTimeout(existing.timeout);
      // Merge logic: Update progress marker to the furthest reported timestamp
      const existingProgress = existing.payload.progressTimestamp || 0;
      const newProgress = progressTimestamp || 0;
      if (newProgress > existingProgress) {
        existing.payload.progressTimestamp = newProgress;
      }
      // Also potentially merge player sources (e.g. "Windows + Web")
      if (existing.payload.player && existing.payload.player !== player) {
        existing.payload.player = \`\${existing.payload.player}, \${player}\`;
      }
    } else {
      existing = { lastReport: now, payload: { ...payload }, timeout: null as any };
    }

    existing.lastReport = now;
    existing.timeout = setTimeout(() => {
      this.commitSession(existing!.payload);
      this.sessions.delete(sessionKey);
    }, 120000); // 2 minutes debounce cooldown

    this.sessions.set(sessionKey, existing);`;

fs.writeFileSync('server.ts', code.replace(target, replacement));
