const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    const sslKeyPath = process.env.SSL_KEY_PATH;
  const sslCertPath = process.env.SSL_CERT_PATH;

  if (sslKeyPath && sslCertPath) {
    try {
      const privateKey = fs.readFileSync(sslKeyPath, 'utf8');
      const certificate = fs.readFileSync(sslCertPath, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(PORT, HOST, () => {
        console.log(\`[SECURE] ASynX Server running with TLS/HTTPS on https://\${HOST}:\${PORT}\`);
      });
    } catch (err) {
      console.error("[ERROR] Failed to load SSL certificates. Falling back to HTTP.", err);
      app.listen(PORT, HOST, () => {
        console.log(\`[WARNING] ASynX Server running on http://\${HOST}:\${PORT} (TLS FAILED)\`);
      });
    }
  } else {
    app.listen(PORT, HOST, () => {
      console.log(\`[INSECURE] ASynX Server running on http://\${HOST}:\${PORT} (No TLS configured)\`);
    });
  }`;

const replacement = `    const sslKeyPath = process.env.SSL_KEY_PATH;
  const sslCertPath = process.env.SSL_CERT_PATH;

  let httpServer;
  if (sslKeyPath && sslCertPath) {
    try {
      const privateKey = fs.readFileSync(sslKeyPath, 'utf8');
      const certificate = fs.readFileSync(sslCertPath, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      httpServer = https.createServer(credentials, app);
    } catch (err) {
      console.error("[ERROR] Failed to load SSL certificates. Falling back to HTTP.", err);
      httpServer = http.createServer(app);
    }
  } else {
    httpServer = http.createServer(app);
  }

  // Initialize WebSockets
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" }
  });
  app.locals.io = io;

  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id);
    });
  });

  httpServer.listen(PORT, HOST, () => {
    console.log(\`ASynX Server is listening on \${HOST}:\${PORT}\`);
  });`;

fs.writeFileSync('server.ts', code.replace(target, replacement));
