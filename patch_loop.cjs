const fs = require('fs');
const file = 'src/components/ASynX (loop).svg';
let content = fs.readFileSync(file, 'utf8');

// Insert the backing ellipse right after </defs>
if (!content.includes('<ellipse style="mix-blend-mode:screen;isolation:isolate"')) {
  content = content.replace(
    '</defs>',
    '</defs><ellipse style="mix-blend-mode:screen;isolation:isolate" rx="120.877923" ry="112.095363" transform="matrix(0.975254 0 0 1.05519 124.950134 125.511795)" fill="rgba(234,254,255,0.82)" stroke-width="0"/>'
  );
  fs.writeFileSync(file, content);
}
