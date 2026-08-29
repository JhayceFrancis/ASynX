const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldMalHandshake = `  // Validate MyAnimeList Credentials
  if (incomingSettings?.mal?.accessToken) {
     if (incomingSettings.mal.accessToken !== oldSettings.mal?.accessToken || !oldSettings.mal?.connected) {
         try {
            SystemLogger.info('Handshake', 'Validating MyAnimeList API credentials...');
            const malRes = await fetch(createSafeUrl('https://api.myanimelist.net/v2/users/@me', ['api.myanimelist.net']), {
                headers: {
                    'Authorization': \`Bearer \${incomingSettings.mal.accessToken}\`
                }
            });
            if (!malRes.ok) {
               SystemLogger.error('Handshake', 'MyAnimeList credentials rejected (401 Unauthorized).');
               return res.status(401).json({ success: false, error: "Invalid MyAnimeList API credentials. Please verify your Access Token." });
            }
            const malData = await malRes.json();
            if (malData.name) {
                incomingSettings.mal.username = malData.name;
            }
            incomingSettings.mal.connected = true;
            SystemLogger.success('Handshake', 'MyAnimeList credentials validated successfully.');
         } catch (e: any) {
            return res.status(500).json({ success: false, error: "Failed to connect to MyAnimeList API." });
         }
     }
  }`;

const newMalHandshake = `  // Validate MyAnimeList Credentials
  if (incomingSettings?.mal?.accessToken) {
     if (incomingSettings.mal.accessToken !== oldSettings.mal?.accessToken || !oldSettings.mal?.connected) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
            SystemLogger.info('Handshake', 'Validating MyAnimeList API credentials...');
            const malRes = await fetch(createSafeUrl('https://api.myanimelist.net/v2/users/@me', ['api.myanimelist.net']), {
                method: 'GET',
                headers: {
                    'Authorization': \`Bearer \${incomingSettings.mal.accessToken}\`
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!malRes.ok) {
               SystemLogger.error('Handshake', \`MyAnimeList credentials rejected. HTTP Status: \${malRes.status}\`);
               return res.status(401).json({ success: false, error: "Invalid MyAnimeList API credentials. Please verify your Access Token." });
            }
            const malData = await malRes.json();
            if (malData.name) {
                incomingSettings.mal.username = malData.name;
            }
            incomingSettings.mal.connected = true;
            SystemLogger.success('Handshake', 'MyAnimeList credentials validated successfully.');
         } catch (e: any) {
            clearTimeout(timeoutId);
            SystemLogger.error('Handshake', 'Network failure whilst validating MyAnimeList credentials.');
            return res.status(500).json({ success: false, error: "Failed to connect to MyAnimeList API." });
         }
     }
  }`;

code = code.replace(oldMalHandshake, newMalHandshake);

const syncFunc = `
/**
 * Synchronises a media item's progress to MyAnimeList.
 * CRITICAL FIX: Payload MUST be application/x-www-form-urlencoded, NOT application/json.
 */
async function synchroniseToMal(animeId: number, episodeProgress: number, accessToken: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  // Construct URL-encoded payload as required by MAL
  const payload = new URLSearchParams();
  payload.append('num_watched_episodes', episodeProgress.toString());

  try {
    SystemLogger.info('Synchronisation', \`Pushing episode update to MyAnimeList for Anime ID: \${animeId}\`);

    const malRes = await fetch(\`https://api.myanimelist.net/v2/anime/\${animeId}/my_list_status\`, {
      method: 'PATCH',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (malRes.status === 429) {
      SystemLogger.warn('Synchronisation', 'MyAnimeList rate limit exceeded. Please retry later.');
      return false;
    }

    if (!malRes.ok) {
      const errorData = await malRes.json().catch(() => ({}));
      SystemLogger.error('Synchronisation', \`MyAnimeList payload rejected. Reason: \${errorData.message || malRes.statusText}\`);
      return false;
    }

    SystemLogger.success('Synchronisation', \`Successfully synchronised Anime ID: \${animeId} to episode \${episodeProgress}.\`);
    return true;

  } catch (error) {
    clearTimeout(timeoutId);
    SystemLogger.error('Synchronisation', 'Network error encountered whilst attempting to synchronise with MyAnimeList.');
    return false;
  }
}
`;

if (!code.includes('synchroniseToMal')) {
  code = code + '\\n' + syncFunc;
}

fs.writeFileSync('server.ts', code);
console.log('Patched');
