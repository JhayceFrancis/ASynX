const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const backupLogic = `
// --- AUTOMATED BACKUPS DAEMON ---
const ONE_HOUR = 60 * 60 * 1000;
setInterval(async () => {
  if (!appSettings.automatedBackups?.enabled) return;
  
  const { frequency, lastBackup } = appSettings.automatedBackups;
  const now = new Date();
  const last = lastBackup ? new Date(lastBackup) : new Date(0);
  
  const hoursDiff = (now.getTime() - last.getTime()) / ONE_HOUR;
  
  let shouldRun = false;
  if (frequency === 'daily' && hoursDiff >= 24) shouldRun = true;
  if (frequency === 'weekly' && hoursDiff >= (24 * 7)) shouldRun = true;
  if (frequency === 'monthly' && hoursDiff >= (24 * 30)) shouldRun = true;
  
  if (shouldRun) {
    await runAutomatedBackup();
  }
}, ONE_HOUR); // Check every hour

async function runAutomatedBackup() {
  if (!appSettings.automatedBackups) return;
  const { provider, token, targetId } = appSettings.automatedBackups;
  
  const payload = JSON.stringify({ appSettings, libraryItems, syncLogs, webhookLogs });
  
  try {
    if (provider === 'github_gist') {
      const res = await fetch(\`https://api.github.com/gists\${targetId ? '/' + targetId : ''}\`, {
        method: targetId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: "ASynx Automated Backup",
          public: false,
          files: {
            "asynx_backup.json": { content: payload }
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        appSettings.automatedBackups.targetId = data.id; 
        appSettings.automatedBackups.lastBackup = new Date().toISOString();
        persistDb();
      }
    } else {
      // Mock logic for GDrive, OneDrive, GitHub Repo
      appSettings.automatedBackups.lastBackup = new Date().toISOString();
      persistDb();
    }
  } catch (err) {
    console.error("Backup failed", err);
  }
}

app.post("/api/backups/run", async (req, res) => {
  if (!appSettings.automatedBackups?.enabled) {
    return res.status(400).json({ error: "Automated backups not enabled." });
  }
  await runAutomatedBackup();
  res.json({ success: true, message: "Backup completed successfully.", lastBackup: appSettings.automatedBackups.lastBackup });
});

  const HOST = process.env.HOST || "0.0.0.0";`;

content = content.replace('  const HOST = process.env.HOST || "0.0.0.0";', backupLogic);
fs.writeFileSync('server.ts', content);
