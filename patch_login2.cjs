const fs = require('fs');
let code = fs.readFileSync('src/components/LoginView.tsx', 'utf8');

code = code.replace(
  'background-image: radial-gradient(circle, #8500be 0.7px, #000000 0.7px);',
  'background-image: radial-gradient(#8500be 0.7000000000000001px, #000000 0.7000000000000001px);'
);

fs.writeFileSync('src/components/LoginView.tsx', code);
console.log("Patched LoginView.tsx again");
