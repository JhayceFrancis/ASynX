const fs = require('fs');
let content = fs.readFileSync('db.ts', 'utf8');

if (!content.includes('fs.mkdirSync')) {
  // Ensure the directory is created in both encrypt and save logic, or simply at the top initialization
  content = content.replace(
    "const ALGORITHM = 'aes-256-gcm';",
    "const ALGORITHM = 'aes-256-gcm';\n\n// Ensure the production persistence directory exists (UK English: Initialisation)\nif (!fs.existsSync(dataDir)) {\n  fs.mkdirSync(dataDir, { recursive: true });\n}"
  );
  
  fs.writeFileSync('db.ts', content);
}
