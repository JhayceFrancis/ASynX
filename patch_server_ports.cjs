const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldColor = "const color = type === 'success' ? 3066993 : type === 'error' ? 15158332 : type === 'warning' ? 16776960 : 3447003;";
const newColor = "const hexString = type === 'success' ? '#2ED831' : type === 'error' ? '#E74C3C' : type === 'warning' ? '#F1C40F' : '#3498DB';\n      const color = Number(hexString.replace('#', '0x'));";

if (code.includes(oldColor)) {
  code = code.replace(oldColor, newColor);
}

code = code.replace(
  /export let activeServerPort: number \| string = 3000;/g, 
  "export let activeServerPort: number | string = process.env.PORT || 3000;"
);

// We need to carefully replace occurrences of localhost:3000
code = code.replace(/http:\/\/localhost:3000/g, 'http://localhost:${process.env.PORT || 3000}');
code = code.replace(/<YOUR_DOCKER_IP>:3000/g, '<YOUR_DOCKER_IP>:${process.env.PORT || 3000}');
code = code.replace(/const initialPort = 3000;/g, 'const initialPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;');

fs.writeFileSync('server.ts', code);
console.log("Patched server ports");
