const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /res\.status\(500\)\.send\('SIMKL_CLIENT_ID not configured'\);/g,
  "res.status(500).type('text/plain').send('SIMKL_CLIENT_ID not configured');"
);
content = content.replace(
  /res\.status\(500\)\.send\('MAL_CLIENT_ID not configured'\);/g,
  "res.status(500).type('text/plain').send('MAL_CLIENT_ID not configured');"
);
content = content.replace(
  /res\.status\(500\)\.send\('ANILIST_CLIENT_ID not configured'\);/g,
  "res.status(500).type('text/plain').send('ANILIST_CLIENT_ID not configured');"
);
content = content.replace(
  /res\.status\(404\)\.send\('Unknown provider'\);/g,
  "res.status(404).type('text/plain').send('Unknown provider');"
);
content = content.replace(
  /res\.status\(400\)\.send\(\`Auth error: \$\{error\}\`\);/g,
  "res.status(400).type('text/plain').send(`Auth error: ${error}`);"
);
content = content.replace(
  /res\.status\(500\)\.send\('Failed to obtain access token\.'\);/g,
  "res.status(500).type('text/plain').send('Failed to obtain access token.');"
);
content = content.replace(
  /res\.status\(500\)\.send\(\`Error exchanging token: \$\{err\.message\}\`\);/g,
  "res.status(500).type('text/plain').send(`Error exchanging token: ${err.message}`);"
);

const oldHtml = `      res.send(\`
        <html>
          <body>
            <script>
              const provider = \${JSON.stringify(req.params.provider || 'unknown')};
              const token = \${JSON.stringify(accessToken)};
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: provider, token: token }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      \`);`;

const newHtml = `      res.send(\`
        <html>
          <body>
            <script>
              const provider = \${JSON.stringify(req.params.provider || 'unknown').replace(/</g, '\\\\u003c')};
              const token = \${JSON.stringify(accessToken).replace(/</g, '\\\\u003c')};
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: provider, token: token }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      \`);`;

content = content.replace(oldHtml, newHtml);

fs.writeFileSync('server.ts', content);
