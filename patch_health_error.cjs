const fs = require('fs');
let code = fs.readFileSync('src/components/SystemHealthView.tsx', 'utf8');

const regex = /  if \(!healthData\) \{[\s\S]*?    \);\n  \}/;

const replacement = `  if (!healthData && !error) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!healthData && error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm max-w-md text-center">
          Failed to fetch system health: {error}
        </div>
        <button 
          onClick={fetchHealth} 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-md"
        >
          Retry Connection
        </button>
      </div>
    );
  }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/SystemHealthView.tsx', code);
