const fs = require('fs');
let content = fs.readFileSync('src/components/LogoBanner.tsx', 'utf8');

const target = `@keyframes xPatternSpinLb {
                    0% { transform: rotate(0deg); animation-timing-function: ease-in; }
                    25% { transform: rotate(720deg); animation-timing-function: linear; }
                    35% { transform: rotate(990deg); animation-timing-function: ease-out; }
                    75% { transform: rotate(1080deg); }
                    100% { transform: rotate(1080deg); }
                  }`;

const replacement = `@keyframes xPatternSpinLb {
                    0% { transform: rotate(45deg); animation-timing-function: ease-in; }
                    25% { transform: rotate(765deg); animation-timing-function: linear; }
                    40% { transform: rotate(1035deg); animation-timing-function: ease-out; }
                    60% { transform: rotate(1125deg); }
                    100% { transform: rotate(1125deg); }
                  }`;

if (content.includes('0% { transform: rotate(0deg); animation-timing-function: ease-in; }')) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/LogoBanner.tsx', content);
  console.log("Successfully patched src/components/LogoBanner.tsx for the X pattern");
} else {
  console.log("Could not find the target string.");
}
