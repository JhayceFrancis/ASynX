const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// 1. Fix ping headers
code = code.replace(
  "'simkl-api-client-id': appSettings.simkl.clientId || ''",
  "'simkl-api-key': appSettings.simkl.clientId || ''"
);

// 2. Fix Handshake
const oldSimklHandshake = `  // Validate Simkl Credentials
  if (incomingSettings?.simkl?.clientId && incomingSettings?.simkl?.accessToken) {
     if (incomingSettings.simkl.clientId !== oldSettings.simkl?.clientId || 
         incomingSettings.simkl.accessToken !== oldSettings.simkl?.accessToken ||
         !oldSettings.simkl?.connected) {
         try {
            SystemLogger.info('Handshake', 'Validating Simkl API credentials...');
            const simklRes = await fetch(createSafeUrl('https://api.simkl.com/users/settings', ['api.simkl.com']), {
                headers: {
                    'Authorization': \`Bearer \${incomingSettings.simkl.accessToken}\`,
                    'simkl-api-client-id': incomingSettings.simkl.clientId
                }
            });
            if (!simklRes.ok) {
               SystemLogger.error('Handshake', 'Simkl credentials rejected (401 Unauthorized).');
               return res.status(401).json({ success: false, error: "Invalid Simkl API credentials. Please verify your Client ID and Access Token." });
            }
            incomingSettings.simkl.connected = true;
            SystemLogger.success('Handshake', 'Simkl credentials validated successfully.');
         } catch (e: any) {
            return res.status(500).json({ success: false, error: "Failed to connect to Simkl API." });
         }
     }
  }`;

const newSimklHandshake = `  // Validate Simkl Credentials
  if (incomingSettings?.simkl?.clientId && incomingSettings?.simkl?.accessToken) {
     if (incomingSettings.simkl.clientId !== oldSettings.simkl?.clientId || 
         incomingSettings.simkl.accessToken !== oldSettings.simkl?.accessToken ||
         !oldSettings.simkl?.connected) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
            SystemLogger.info('Handshake', 'Validating Simkl API credentials...');
            const simklRes = await fetch(createSafeUrl('https://api.simkl.com/users/settings', ['api.simkl.com']), {
                method: 'GET',
                headers: {
                    'Authorization': \`Bearer \${incomingSettings.simkl.accessToken}\`,
                    'simkl-api-key': incomingSettings.simkl.clientId
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!simklRes.ok) {
               SystemLogger.error('Handshake', \`Simkl credentials rejected. HTTP Status: \${simklRes.status}\`);
               return res.status(401).json({ success: false, error: "Invalid Simkl API credentials. Please verify your Client ID and Access Token." });
            }
            incomingSettings.simkl.connected = true;
            SystemLogger.success('Handshake', 'Simkl credentials validated successfully.');
         } catch (e: any) {
            clearTimeout(timeoutId);
            SystemLogger.error('Handshake', 'Network failure whilst validating Simkl credentials.');
            return res.status(500).json({ success: false, error: "Failed to connect to Simkl API." });
         }
     }
  }`;

code = code.replace(oldSimklHandshake, newSimklHandshake);

// 3. Add synchroniseToSimkl
const syncFunc = `
/**
 * Synchronises a media item's progress to Simkl.
 * CRITICAL FIX: Ensure dual-header (Authorization + simkl-api-key) payload.
 */
async function synchroniseToSimkl(simklId: number, episodeProgress: number, accessToken: string, clientId: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const payload = {
    shows: [
      {
        ids: { simkl: simklId },
        episodes: [{ number: episodeProgress }]
      }
    ]
  };

  try {
    SystemLogger.info('Synchronisation', \`Pushing episode update to Simkl for Media ID: \${simklId}\`);

    const simklRes = await fetch('https://api.simkl.com/sync/history', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'simkl-api-key': clientId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (simklRes.status === 429) {
      SystemLogger.warn('Synchronisation', 'Simkl rate limit exceeded. Please retry later.');
      return false;
    }

    if (!simklRes.ok) {
      const errorData = await simklRes.json().catch(() => ({}));
      SystemLogger.error('Synchronisation', \`Simkl payload rejected. Reason: \${errorData.error || simklRes.statusText}\`);
      return false;
    }

    SystemLogger.success('Synchronisation', \`Successfully synchronised Media ID: \${simklId} to episode \${episodeProgress}.\`);
    return true;

  } catch (error) {
    clearTimeout(timeoutId);
    SystemLogger.error('Synchronisation', 'Network error encountered whilst attempting to synchronise with Simkl.');
    return false;
  }
}
`;

if (!code.includes('synchroniseToSimkl')) {
  code = code + '\\n' + syncFunc;
}

fs.writeFileSync('server.ts', code);
console.log('Patched Simkl');
