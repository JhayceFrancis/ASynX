const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const helpers = `
// ==========================================
// NOTIFICATION & OUTBOUND SYNC ENGINE
// ==========================================

async function dispatchPushNotifications(title, message, type) {
  if (!appSettings.pushNotifications?.enabled) return;

  const { discordWebhookUrl, appriseUrl, browserNotifications } = appSettings.pushNotifications;

  // 1. Browser Native Push / Socket.IO
  if (browserNotifications) {
    app.locals.io?.emit('push_notification', { title, message, type });
  }

  // 2. Discord Webhook
  if (discordWebhookUrl) {
    try {
      const color = type === 'success' ? 3066993 : type === 'error' ? 15158332 : type === 'warning' ? 16776960 : 3447003;
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: title,
            description: message,
            color: color,
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (e) {
      SystemLogger.error('Notification', 'Failed to send Discord webhook.');
    }
  }

  // 3. Apprise URL
  if (appriseUrl) {
    try {
      await fetch(appriseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          body: message,
          type: type === 'error' ? 'failure' : type // apprise types: info, success, warning, failure
        })
      });
    } catch (e) {
      SystemLogger.error('Notification', 'Failed to send Apprise webhook.');
    }
  }
}

async function triggerOutboundSync(item, targetEpisode) {
  let successCount = 0;
  let platformsSynced = [];
  let errors = [];

  // 1. SIMKL
  if (appSettings.simkl.connected && item.platforms.simkl && item.platforms.simkl.id && item.platforms.simkl.id !== 'simkl-none') {
    try {
      const success = await synchroniseToSimkl(parseInt(item.platforms.simkl.id), targetEpisode, appSettings.simkl.accessToken, appSettings.simkl.clientId);
      if (success) {
        successCount++;
        platformsSynced.push('simkl');
        item.platforms.simkl.episode = targetEpisode;
        item.platforms.simkl.synced = true;
      }
    } catch (e) { errors.push('Simkl'); }
  }

  // 2. MAL
  if (appSettings.mal.connected && item.platforms.mal && item.platforms.mal.id && item.platforms.mal.id !== 'mal-none') {
    try {
      const success = await synchroniseToMal(parseInt(item.platforms.mal.id), targetEpisode, appSettings.mal.accessToken);
      if (success) {
        successCount++;
        platformsSynced.push('mal');
        item.platforms.mal.episode = targetEpisode;
        item.platforms.mal.synced = true;
      }
    } catch (e) { errors.push('MAL'); }
  }

  // 3. Anilist
  if (appSettings.anilist.connected && item.platforms.anilist && item.platforms.anilist.id && item.platforms.anilist.id !== 'anilist-none') {
    try {
      const success = await synchroniseToAnilist(parseInt(item.platforms.anilist.id), targetEpisode, appSettings.anilist.accessToken);
      if (success) {
        successCount++;
        platformsSynced.push('anilist');
        item.platforms.anilist.episode = targetEpisode;
        item.platforms.anilist.synced = true;
      }
    } catch (e) { errors.push('Anilist'); }
  }

  // 4. Karakeep
  if (appSettings.karakeep.connected && item.platforms.karakeep && item.platforms.karakeep.id && item.platforms.karakeep.id !== 'karakeep-none') {
    try {
      const success = await synchroniseToKarakeep(item.platforms.karakeep.id, targetEpisode, appSettings.karakeep.apiKey, appSettings.karakeep.apiUrl);
      if (success) {
        successCount++;
        platformsSynced.push('karakeep');
        item.platforms.karakeep.episode = targetEpisode;
        item.platforms.karakeep.synced = true;
      }
    } catch (e) { errors.push('Karakeep'); }
  }

  if (platformsSynced.length > 0) {
    if (appSettings.pushNotifications?.triggers?.onSyncSuccess) {
      dispatchPushNotifications('Outbound Sync Successful', \`\${item.title} synced to Ep \${targetEpisode} on \${platformsSynced.join(', ')}\`, 'success');
    }
  }

  if (errors.length > 0) {
    if (appSettings.pushNotifications?.triggers?.onSyncFailure) {
      dispatchPushNotifications('Outbound Sync Failed', \`Failed to sync \${item.title} to \${errors.join(', ')}\`, 'error');
    }
  }

  return { successCount, platformsSynced };
}
`;

// Insert the helpers right before executeBackendDockerSyncDaemonCycle
const target = `async function executeBackendDockerSyncDaemonCycle() {`;
if (code.includes(target) && !code.includes('dispatchPushNotifications')) {
  code = code.replace(target, helpers + '\n' + target);
  fs.writeFileSync('server.ts', code);
  console.log('Added helpers');
} else {
  console.log('Target not found or already added');
}
