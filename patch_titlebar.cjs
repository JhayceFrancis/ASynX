const fs = require('fs');
let content = fs.readFileSync('src/components/Win11TitleBar.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

content = content.replace(
  "  const [windowVisible, setWindowVisible] = useState(true);",
  "  const [windowVisible, setWindowVisible] = useState(true);\n  const [serverPort, setServerPort] = useState<string | number>('...');\n\n  useEffect(() => {\n    fetch('/api/status')\n      .then(res => res.json())\n      .then(data => setServerPort(data.port))\n      .catch(() => setServerPort('ERROR'));\n  }, []);"
);

content = content.replace(
  "<span>Sync Service: Running (127.0.0.1:3000)</span>",
  "<span>Sync Service: {serverPort === 'ERROR' ? 'Disconnected' : `Running (localhost:${serverPort})`}</span>"
);

fs.writeFileSync('src/components/Win11TitleBar.tsx', content);
