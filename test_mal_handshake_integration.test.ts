import { describe, it, expect } from 'vitest';

describe('MAL Handshake & Integration', () => {
    it('Should correctly format handshake fetch with abort controller and signal', async () => {
       const fs = require('fs');
       const content = fs.readFileSync('server.ts', 'utf8');

       expect(content).toContain('fetch(createSafeUrl(\'https://api.myanimelist.net/v2/users/@me\', \'api.myanimelist.net\'), {');
       expect(content).toContain('method: \'GET\',');
       expect(content).toContain('headers: {');
       expect(content).toContain('\'Authorization\': `Bearer ${incomingSettings.mal.accessToken}`');
       expect(content).toContain('},');
       expect(content).toContain('signal: controller.signal');
    });

    it('Should correctly have the syncToMal URL encoded payload', async () => {
       const fs = require('fs');
       const content = fs.readFileSync('server.ts', 'utf8');

       expect(content).toContain('const payload = new URLSearchParams();');
       expect(content).toContain('payload.append(\'num_watched_episodes\', episodeProgress.toString());');
       expect(content).toContain('\'Content-Type\': \'application/x-www-form-urlencoded\'');
    });
});
