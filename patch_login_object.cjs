const fs = require('fs');
const file = 'src/components/LoginView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<img src={asynxLoopBg} alt="" style={{ width: 256, height: 256 }} className="text-indigo-500 opacity-50" />',
  '<object data={asynxLoopBg} type="image/svg+xml" style={{ width: 256, height: 256 }} className="text-indigo-500 opacity-50 pointer-events-none" aria-label="ASynX Loop Logo" />'
);

fs.writeFileSync(file, content);
