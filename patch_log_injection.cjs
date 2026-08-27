const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `    // Also log to terminal
    if (level === 'error') console.error(\`[\${category}] \${message}\`);
    else if (level === 'warn') console.warn(\`[\${category}] \${message}\`);
    else if (level === 'maintenance') console.log(\`[\${category}] [MAINTENANCE] \${message}\`);
    else console.log(\`[\${category}] \${message}\`);`;

const replacement = `    // Also log to terminal
    const safeCat = category.replace(/[\\r\\n]/g, '');
    const safeMsg = message.replace(/[\\r\\n]/g, ' ');
    if (level === 'error') console.error(\`[\${safeCat}] \${safeMsg}\`);
    else if (level === 'warn') console.warn(\`[\${safeCat}] \${safeMsg}\`);
    else if (level === 'maintenance') console.log(\`[\${safeCat}] [MAINTENANCE] \${safeMsg}\`);
    else console.log(\`[\${safeCat}] \${safeMsg}\`);`;

content = content.replace(target, replacement);

fs.writeFileSync('server.ts', content);
