const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add Calendar icon to imports
content = content.replace("Settings, ShieldCheck", "Settings, ShieldCheck, Calendar");

// Add case to activeTabNode
content = content.replace(
  "case 'extension': return <><Compass className=\"w-5 h-5 text-cyan-500\" /><span>Extension / Webhook State</span></>;",
  "case 'extension': return <><Compass className=\"w-5 h-5 text-cyan-500\" /><span>Extension / Webhook State</span></>;\n                  case 'schedule': return <><Calendar className=\"w-5 h-5 text-fuchsia-500\" /><span>Sync Schedule</span></>;"
);

// Add Tab Button
const scheduleTab = `
               <motion.button layoutId="tab-schedule" onClick={() => setActiveTab('schedule')} className={\`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden \${activeTab === 'schedule' ? 'bg-fuchsia-600/20 text-fuchsia-600 dark:text-fuchsia-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'}\`}>
  <Calendar className="w-4 h-4 flex-shrink-0" />
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {'Sync Schedule'}
  </span>
</motion.button>
`;

content = content.replace(
  "               <motion.button layoutId=\"tab-conflicts\"",
  scheduleTab + "               <motion.button layoutId=\"tab-conflicts\""
);

fs.writeFileSync('src/components/Navbar.tsx', content);
