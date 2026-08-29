const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  // Prototype Pollution Prevention`;
const insertion = `  if (incomingSettings?.karakeep) {
    const baseUrl = process.env.APP_URL || \`http://\${req.headers.host}\`;
    incomingSettings.karakeep.webhookUrl = incomingSettings.karakeep.apiKey 
      ? \`\${baseUrl}/api/webhooks/karakeep?authKey=\${incomingSettings.karakeep.apiKey}\`
      : \`\${baseUrl}/api/webhooks/karakeep\`;
  }

  // Prototype Pollution Prevention`;

code = code.replace(targetStr, insertion);

const syncFunc = `
/**
 * Synchronises a media item's progress to Karakeep.
 * CRITICAL FIX: Ensure strict payload types and static API Key.
 */
async function synchroniseToKarakeep(mediaId: string, episodeProgress: number, apiKey: string, apiUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const payload = {
    id: String(mediaId),
    episode: Number(episodeProgress)
  };

  try {
    SystemLogger.info('Synchronisation', \`Pushing episode update to Karakeep for Media ID: \${mediaId}\`);

    const karakeepRes = await fetch(\`\${apiUrl}/api/v1/sync\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!karakeepRes.ok) {
      const errorData = await karakeepRes.json().catch(() => ({}));
      SystemLogger.error('Synchronisation', \`Karakeep payload rejected. Reason: \${errorData.error || karakeepRes.statusText}\`);
      return false;
    }

    SystemLogger.success('Synchronisation', \`Successfully synchronised Media ID: \${mediaId} to episode \${episodeProgress}.\`);
    return true;

  } catch (error) {
    clearTimeout(timeoutId);
    SystemLogger.error('Synchronisation', 'Network error encountered whilst attempting to synchronise with Karakeep.');
    return false;
  }
}
`;

if (!code.includes('synchroniseToKarakeep')) {
  code = code + '\n' + syncFunc;
}

fs.writeFileSync('server.ts', code);
console.log('Patched Karakeep');
