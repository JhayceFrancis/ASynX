const fs = require('fs');

let code = fs.readFileSync('src/components/SyncMatrixView.tsx', 'utf8');

// Fix row hover
code = code.replace(
  /className="hover:bg-gray-100 dark:bg-\[#111\]\/30 transition"/g,
  'className="hover:bg-gray-100 dark:bg-[#111]/30 dark:hover:bg-[#222] transition"'
);

// Fix lg:col-span-2 to have min-w-0 to prevent flex children blowing out the grid
code = code.replace(
  /<div className="lg:col-span-2 space-y-4">/,
  '<div className="lg:col-span-2 space-y-4 min-w-0">'
);

// Fix Controls Bar wrapping and flex layout overflow
code = code.replace(
  /<div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">/,
  '<div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end min-w-0">'
);

// Add max-w-full and pb-1 to filter pills to allow scroll without clipping
code = code.replace(
  /<div className="flex items-center space-x-1\.5 overflow-x-auto scrollbar-none">/,
  '<div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none max-w-full pb-1">'
);

// Ensure grid items also have correct dark hover (they currently have hover:shadow-md)
// No, grid items don't have text readability issues directly from backgrounds as they don't change bg on hover by default, only border/shadow, but we will add dark:hover:bg-[#151515] just in case.
code = code.replace(
  /className=\\\`bg-white dark:bg-\[#0a0a0a\] border rounded-2xl p-4 shadow-sm transition hover:shadow-md relative \$\{/,
  'className={`bg-white dark:bg-[#0a0a0a] border rounded-2xl p-4 shadow-sm transition hover:shadow-md dark:hover:bg-[#111] relative ${'
);

fs.writeFileSync('src/components/SyncMatrixView.tsx', code);
