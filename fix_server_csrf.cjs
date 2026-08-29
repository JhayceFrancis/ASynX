const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'ignoredMethods: ["GET", "HEAD", "OPTIONS"],',
  'ignoredMethods: ["GET", "HEAD", "OPTIONS"],\n  getSessionIdentifier: (req) => req.cookies?.token || "anonymous",'
);

fs.writeFileSync('server.ts', code);
console.log("Fixed getSessionIdentifier");
