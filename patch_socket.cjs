const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `  syncLogs.unshift(newLog);

  res.json({
    success: true,
    message: \`Sync completed for \${affected.length} items.\`,
    logs: syncLogs.slice(0, 20)
  });
});`;

const replacement1 = `  syncLogs.unshift(newLog);
  persistDb();

  if (app.locals.io) {
    app.locals.io.emit('state_change', { type: 'sync_complete', affected: affected.length });
  }

  res.json({
    success: true,
    message: \`Sync completed for \${affected.length} items.\`,
    logs: syncLogs.slice(0, 20)
  });
});`;

const target2 = `  syncLogs.unshift(newLog);
  persistDb();
  
  res.json({ success: true, item });
});`;

const replacement2 = `  syncLogs.unshift(newLog);
  persistDb();
  
  if (app.locals.io) {
    app.locals.io.emit('state_change', { type: 'sync_complete', itemId });
  }

  res.json({ success: true, item });
});`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
fs.writeFileSync('server.ts', code);
