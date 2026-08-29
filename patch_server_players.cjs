const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const scanRoute = `
app.get("/api/daemon/local-player/status", (req, res) => {
  const { exec } = require('child_process');
  exec('tasklist /FO CSV /NH', (err, stdout) => {
    if (err) {
      return res.json({ activePlayer: null });
    }
    const output = stdout.toLowerCase();
    let activePlayer = null;
    if (output.includes('mpc-be64.exe') || output.includes('mpc-be.exe')) {
      activePlayer = 'MPC-BE';
    } else if (output.includes('mpv.exe')) {
      activePlayer = 'MPV';
    } else if (output.includes('vlc.exe')) {
      activePlayer = 'VLC';
    }
    res.json({ activePlayer });
  });
});
`;

if (!content.includes('/api/daemon/local-player/status')) {
  content = content.replace('app.get("/api/settings",', scanRoute + '\napp.get("/api/settings",');
  fs.writeFileSync(file, content);
  console.log("Patched server.ts with /api/daemon/local-player/status");
} else {
  console.log("Route already exists.");
}
