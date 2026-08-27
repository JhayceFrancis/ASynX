const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));`;

const replacement = `app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Apply rate limiter globally to all API routes
app.use("/api/", proxyLimiter);`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
