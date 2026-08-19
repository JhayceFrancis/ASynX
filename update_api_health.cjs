const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const oldHealthRegex = /app\.get\("\/api\/health", \(req, res\) => \{\s*res\.json\(\{ status: 'ok', uptime: process\.uptime\(\) \}\);\s*\}\);/;

const newHealth = `app.get("/api/health", async (req, res) => {
  const checkService = async (url) => {
    try {
      const start = Date.now();
      const response = await fetch(url, { method: 'GET' });
      // As long as the server responds (even 4xx/5xx), we have a connection.
      // But 5xx might mean degraded. Let's assume any response means reachable.
      const latencyMs = Date.now() - start;
      return { 
        status: response.status < 500 ? "operational" : "degraded", 
        latencyMs 
      };
    } catch (error) {
      return { status: "disconnected", latencyMs: 0, error: error instanceof Error ? error.message : String(error) };
    }
  };

  const [mal, anilist, simkl] = await Promise.all([
    checkService("https://myanimelist.net/"), 
    checkService("https://graphql.anilist.co/"),
    checkService("https://api.simkl.com/ping")
  ]);

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    services: {
      mal,
      anilist,
      simkl
    }
  });
});`;

if (oldHealthRegex.test(serverCode)) {
  serverCode = serverCode.replace(oldHealthRegex, newHealth);
  fs.writeFileSync('server.ts', serverCode);
  console.log("Updated /api/health");
} else {
  console.log("Regex not matched.");
}
