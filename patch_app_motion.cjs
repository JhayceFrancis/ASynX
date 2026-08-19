const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { motion, AnimatePresence } from 'motion/react';")) {
  code = "import { motion, AnimatePresence } from 'motion/react';\n" + code;
}

const mainContentRegex = /<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">([\s\S]*?)<\/main>/;

const match = code.match(mainContentRegex);

if (match) {
  const content = match[1];
  const newContent = `
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
${content}
            </motion.div>
          </AnimatePresence>
        `;
  
  code = code.replace(mainContentRegex, `<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">${newContent}</main>`);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx with motion");
} else {
  console.log("Could not find main content block");
}

