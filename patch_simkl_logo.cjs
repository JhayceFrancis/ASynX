const fs = require('fs');
let content = fs.readFileSync('src/components/PlatformLogos.tsx', 'utf8');

const simklTarget = `export const SimklLogo = ({ className }: { className?: string }) => (
  <div className={\`flex items-center justify-center font-black bg-[#ffeb3b] text-black rounded \${className}\`} style={{ width: '1em', height: '1em', fontSize: 'inherit' }}>
    <span style={{ fontSize: '0.7em', marginTop: '-0.1em' }}>S</span>
  </div>
);`;

const simklReplace = `export const SimklLogo = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L22 20H2L12 2Z" fill="currentColor"/>
  </svg>
);`;

content = content.replace(simklTarget, simklReplace);
fs.writeFileSync('src/components/PlatformLogos.tsx', content);
