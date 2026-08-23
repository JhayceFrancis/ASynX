const fs = require('fs');

const distPath = 'dist/assets';
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  files.forEach(file => {
    if (file.endsWith('.js') && file.startsWith('vendor-react-')) {
       console.log('Vendor React:', file);
    }
  });
}
