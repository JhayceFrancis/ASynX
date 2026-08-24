const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('import rateLimit from "express-rate-limit";')) {
  content = content.replace(
    'import cors from "cors";',
    'import cors from "cors";\nimport rateLimit from "express-rate-limit";'
  );
}

const authLimiterCode = `
// Rate Limiting Middlewares
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per windowMs
  message: { error: 'Too many authentication requests from this IP, please try again after 15 minutes.' }
});

const proxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // Limit each IP to 300 API requests per windowMs
  message: { error: 'Too many API requests from this IP, please try again after 15 minutes.' }
});
`;

if (!content.includes('const authLimiter = rateLimit')) {
  content = content.replace(
    "app.use(express.urlencoded({ extended: true, limit: '10mb' }));",
    "app.use(express.urlencoded({ extended: true, limit: '10mb' }));\n" + authLimiterCode
  );
}

// Apply authLimiter to auth routes
content = content.replace(
  /app\.get\("\/api\/auth\/:provider\/login", \(req, res\) => \{/g,
  'app.get("/api/auth/:provider/login", authLimiter, (req, res) => {'
);
content = content.replace(
  /app\.get\("\/api\/auth\/:provider\/callback", async \(req, res\) => \{/g,
  'app.get("/api/auth/:provider/callback", authLimiter, async (req, res) => {'
);

// Apply proxyLimiter to proxy routes (/api/remote-sync/, /api/plex/match, etc.)
content = content.replace(
  /app\.post\("\/api\/remote-sync\/receive"/g,
  'app.post("/api/remote-sync/receive", proxyLimiter'
);
content = content.replace(
  /app\.post\("\/api\/remote-sync\/export"/g,
  'app.post("/api/remote-sync/export", proxyLimiter'
);
content = content.replace(
  /app\.post\("\/api\/remote-sync\/info"/g,
  'app.post("/api/remote-sync/info", proxyLimiter'
);
content = content.replace(
  /app\.post\("\/api\/remote-sync\/pull"/g,
  'app.post("/api/remote-sync/pull", proxyLimiter'
);
content = content.replace(
  /app\.post\("\/api\/remote-sync\/push"/g,
  'app.post("/api/remote-sync/push", proxyLimiter'
);

fs.writeFileSync('server.ts', content);
