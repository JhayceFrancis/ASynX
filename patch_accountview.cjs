const fs = require('fs');
const file = 'src/components/AccountView.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('SecureCredentialManager')) {
  // Import statement
  const importStatement = "import { SecureCredentialManager } from './SecureCredentialManager';\n";
  
  // Insert import at the top after other imports
  const firstImportMatch = content.match(/import.*?;\n/);
  if (firstImportMatch) {
    content = content.replace(/import { UserCircle.*?;\n/, match => match + importStatement);
  }

  // Insert component at the bottom before the last closing div of the main container
  // The structure seems to end with something like:
  //       </div>
  //     </div>
  //   );
  // }
  
  const endRegex = /(<\/div>\s*<\/div>\s*<\/div>\s*\)\s*;\s*\})/s;
  if (content.match(endRegex)) {
    content = content.replace(
      /(\s*)(<\/div>\s*<\/div>\s*<\/div>\s*\)\s*;\s*\})/s,
      `$1  <SecureCredentialManager />\n$1$2`
    );
  } else {
      // Let's try to just append it before the last </div>
      const lines = content.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].includes('</div>')) {
              // Not very safe, better to replace just before the second to last </div> which closes the max-w-4xl container maybe?
              break;
          }
      }
  }
}

fs.writeFileSync(file, content);
console.log("Patched AccountView");
