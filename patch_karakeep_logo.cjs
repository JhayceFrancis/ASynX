const fs = require('fs');
let content = fs.readFileSync('src/components/PlatformLogos.tsx', 'utf8');
content = content.replace(/export const KarakeepLogo[\s\S]*?;\n\);\n/, '');
content += `\nexport const KarakeepLogo = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="currentColor"/>
    <path d="M7 6v12h2.5v-4.5L13.5 18H17l-5-5.5 4.5-6h-3.5L10 11V6H7z" fill="white"/>
  </svg>
);\n`;
fs.writeFileSync('src/components/PlatformLogos.tsx', content);
