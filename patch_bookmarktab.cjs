const fs = require('fs');
let content = fs.readFileSync('src/components/bookmarks/BookmarkTab.tsx', 'utf8');

const target1 = `export const BookmarkTab: React.FC = () => {`;
const replacement1 = `import { AppSettings } from '../../types';\n\nexport const BookmarkTab: React.FC<{ settings?: AppSettings }> = ({ settings }) => {`;

const target2 = `Nexus_Bookmarks`;
const replacement2 = `{settings?.nexusTabName || 'Nexus_Bookmarks'}`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
fs.writeFileSync('src/components/bookmarks/BookmarkTab.tsx', content);
