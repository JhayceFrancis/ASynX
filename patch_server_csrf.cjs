const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("csrf-csrf")) {
  code = code.replace(
    'import { URL } from \'url\';',
    'import { URL } from \'url\';\nimport { doubleCsrf } from "csrf-csrf";'
  );
}

const csrfCode = `
// ==========================================
// CSRF Protection
// ==========================================
const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET || "fallback-secret-for-dev",
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"]
});

app.get("/api/csrf-token", (req, res) => {
  const csrfToken = generateCsrfToken(req, res);
  res.json({ csrfToken });
});

const csrfMiddleware = (req, res, next) => {
  const isApi = req.path.startsWith('/api/');
  const isWebhook = req.path.startsWith('/api/webhooks/') || 
                    req.path.startsWith('/api/remote-sync/') ||
                    req.path.startsWith('/api/extension/') ||
                    req.path.startsWith('/api/auth/') ||
                    req.path === '/api/ingest' ||
                    req.path === '/api/playback/heartbeat' ||
                    req.path === '/api/daemon/report' ||
                    req.path === '/api/daemon/scrobble';
  if (!isApi || isWebhook) {
    return next();
  }
  return doubleCsrfProtection(req, res, next);
};

app.use(csrfMiddleware);
`;

if (!code.includes("CSRF Protection")) {
  code = code.replace(
    'app.use(express.urlencoded({ extended: true, limit: \'10mb\' }));',
    'app.use(express.urlencoded({ extended: true, limit: \'10mb\' }));\n' + csrfCode
  );
}

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with CSRF middleware");
