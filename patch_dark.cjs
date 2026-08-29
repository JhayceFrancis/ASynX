const fs = require('fs');
const file = 'src/components/LoginView.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-\[#121212\]"/;
content = content.replace(regex, 'className="dark min-h-screen relative flex flex-col items-center justify-center p-4 bg-[#121212] text-gray-100"');

fs.writeFileSync(file, content);
