const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const statusRoute = `
// Server Status Route
export let activeServerPort: number | string = process.env.PORT || 4000;
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', port: activeServerPort });
});
`;

content = content.replace(
  '// API Route for Logs',
  statusRoute + '\n// API Route for Logs'
);

content = content.replace(
  "const actualPort = typeof addr === 'string' ? addr : addr.port;",
  "const actualPort = typeof addr === 'string' ? addr : addr.port;\n      activeServerPort = actualPort;"
);

fs.writeFileSync('server.ts', content);
