const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldAnilistHandshake = `  // Validate AniList Credentials
  if (incomingSettings?.anilist?.accessToken) {
     if (incomingSettings.anilist.accessToken !== oldSettings.anilist?.accessToken || !oldSettings.anilist?.connected) {
         try {
            SystemLogger.info('Handshake', 'Validating AniList API credentials...');
            const anilistRes = await fetch(createSafeUrl('https://graphql.anilist.co', ['graphql.anilist.co']), {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${incomingSettings.anilist.accessToken}\`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: \`
                        query {
                            Viewer {
                                id
                                name
                            }
                        }
                    \`
                })
            });
            if (!anilistRes.ok) {
               SystemLogger.error('Handshake', 'AniList credentials rejected (401 Unauthorized).');
               return res.status(401).json({ success: false, error: "Invalid AniList API credentials. Please verify your Access Token." });
            }
            const anilistData = await anilistRes.json();
            if (anilistData.data && anilistData.data.Viewer) {
                incomingSettings.anilist.username = anilistData.data.Viewer.name;
            }
            incomingSettings.anilist.connected = true;
            SystemLogger.success('Handshake', 'AniList credentials validated successfully.');
         } catch (e: any) {
            return res.status(500).json({ success: false, error: "Failed to connect to AniList API." });
         }
     }
  }`;

const newAnilistHandshake = `  // Validate AniList Credentials
  if (incomingSettings?.anilist?.accessToken) {
     if (incomingSettings.anilist.accessToken !== oldSettings.anilist?.accessToken || !oldSettings.anilist?.connected) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
            SystemLogger.info('Handshake', 'Validating AniList API credentials...');
            const anilistRes = await fetch(createSafeUrl('https://graphql.anilist.co', ['graphql.anilist.co']), {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${incomingSettings.anilist.accessToken}\`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: \`
                        query {
                            Viewer {
                                id
                                name
                            }
                        }
                    \`
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!anilistRes.ok) {
               SystemLogger.error('Handshake', \`AniList credentials rejected. HTTP Status: \${anilistRes.status}\`);
               return res.status(401).json({ success: false, error: "Invalid AniList API credentials. Please verify your Access Token." });
            }
            const anilistData = await anilistRes.json();
            if (anilistData.data && anilistData.data.Viewer) {
                incomingSettings.anilist.username = anilistData.data.Viewer.name;
            }
            incomingSettings.anilist.connected = true;
            SystemLogger.success('Handshake', 'AniList credentials validated successfully.');
         } catch (e: any) {
            clearTimeout(timeoutId);
            SystemLogger.error('Handshake', 'Network failure whilst validating AniList credentials.');
            return res.status(500).json({ success: false, error: "Failed to connect to AniList API." });
         }
     }
  }`;

code = code.replace(oldAnilistHandshake, newAnilistHandshake);

const syncFunc = `
/**
 * Synchronises a media item's progress to AniList.
 * CRITICAL FIX: Ensure strict JSON payload and all required headers.
 */
async function synchroniseToAnilist(mediaId: number, episodeProgress: number, accessToken: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const query = \`
    mutation ($id: Int, $progress: Int) {
      SaveMediaListEntry (mediaId: $id, progress: $progress) {
        id
        progress
      }
    }
  \`;

  const variables = {
    id: mediaId,
    progress: episodeProgress
  };

  try {
    SystemLogger.info('Synchronisation', \`Pushing episode update to AniList for Media ID: \${mediaId}\`);

    const anilistRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (anilistRes.status === 429) {
      SystemLogger.warn('Synchronisation', 'AniList rate limit exceeded. Please retry later.');
      return false;
    }

    if (!anilistRes.ok) {
      const errorData = await anilistRes.json().catch(() => ({}));
      SystemLogger.error('Synchronisation', \`AniList payload rejected. Reason: \${JSON.stringify(errorData.errors) || anilistRes.statusText}\`);
      return false;
    }

    SystemLogger.success('Synchronisation', \`Successfully synchronised Media ID: \${mediaId} to episode \${episodeProgress}.\`);
    return true;

  } catch (error) {
    clearTimeout(timeoutId);
    SystemLogger.error('Synchronisation', 'Network error encountered whilst attempting to synchronise with AniList.');
    return false;
  }
}
`;

if (!code.includes('synchroniseToAnilist')) {
  code = code + '\\n' + syncFunc;
}

fs.writeFileSync('server.ts', code);
console.log('Patched AniList');
