const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Update activeTabNode switch
content = content.replace(
  /case 'performance': return <><Activity className="w-5 h-5 text-purple-500" \/><span>Sync Performance<\/span><\/>;/,
  ""
);
content = content.replace(
  /case 'health': return <><Activity className="w-5 h-5 text-emerald-500" \/><span>System Health<\/span><\/>;/,
  "case 'health': return <><Activity className=\"w-5 h-5 text-emerald-500\" /><span>System Health & Performance</span></>;"
);

// Remove the small 'performance' nav button
content = content.replace(
  /<motion\.button layoutId="tab-performance"[\s\S]*?<\/motion\.button>/g,
  ""
);

// Update the large tab buttons in Win11 style or default
content = content.replace(
  /activeTab === 'performance' \? 'bg-purple-600\/20 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-\[#111\]'/g,
  ""
);

content = content.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('performance'\)\}[\s\S]*?<\/button>/g,
  ""
);

fs.writeFileSync('src/components/Navbar.tsx', content);
