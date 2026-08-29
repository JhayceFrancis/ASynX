const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'getTokenFromRequest: (req) => req.headers["x-csrf-token"]',
  'getCsrfTokenFromRequest: (req: any) => req.headers["x-csrf-token"]'
);

code = code.replace(
  'const csrfMiddleware = (req, res, next) => {',
  'const csrfMiddleware = (req: any, res: any, next: any) => {'
);

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts types");
