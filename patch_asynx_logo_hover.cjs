const fs = require('fs');
let code = fs.readFileSync('src/components/ASynXLogo.tsx', 'utf8');

code = code.replace(
  /const isHovered = useRef\(false\);/,
  'const [isHovered, setIsHovered] = useState(false);'
);

code = code.replace(
  /isHovered\.current = true;/,
  'setIsHovered(true);'
);

code = code.replace(
  /isHovered\.current = false;/,
  'setIsHovered(false);'
);

code = code.replace(
  /isHovered\.current/g,
  'isHovered'
);

fs.writeFileSync('src/components/ASynXLogo.tsx', code);
