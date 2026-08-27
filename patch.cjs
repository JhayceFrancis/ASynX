const fs = require('fs');
let content = fs.readFileSync('src/components/LogoBanner.tsx', 'utf8');

const target = `                  .shuriken-idle-lb {
                    animation: infiniteSpinLb 15s linear infinite;
                    transform-origin: 200px 200px;
                  }
                  .shuriken-syncing-lb {
                    animation: infiniteSpinLb 1.5s linear infinite;
                    transform-origin: 200px 200px;
                  }
                  .shuriken-fast-lb {
                    animation: infiniteSpinLb 0.5s linear infinite;
                    transform-origin: 200px 200px;
                  }
                  @keyframes flyInLb {
                    0% { transform: translateX(100vw) rotate(1080deg) scale(0.5); opacity: 0; }
                    100% { transform: translateX(0px) rotate(0deg) scale(1); opacity: 1; }
                  }
                  @keyframes infiniteSpinLb {`;

const replacement = `                  .shuriken-idle-lb {
                    animation: xPatternSpinLb 5s infinite;
                    transform-origin: 200px 200px;
                  }
                  .shuriken-syncing-lb {
                    animation: infiniteSpinLb 1.5s linear infinite;
                    transform-origin: 200px 200px;
                  }
                  .shuriken-fast-lb {
                    animation: infiniteSpinLb 0.5s linear infinite;
                    transform-origin: 200px 200px;
                  }
                  @keyframes flyInLb {
                    0% { transform: translateX(100vw) rotate(1080deg) scale(0.5); opacity: 0; }
                    100% { transform: translateX(0px) rotate(0deg) scale(1); opacity: 1; }
                  }
                  @keyframes xPatternSpinLb {
                    0% { transform: rotate(0deg); animation-timing-function: ease-in; }
                    25% { transform: rotate(720deg); animation-timing-function: linear; }
                    35% { transform: rotate(990deg); animation-timing-function: ease-out; }
                    75% { transform: rotate(1080deg); }
                    100% { transform: rotate(1080deg); }
                  }
                  @keyframes infiniteSpinLb {`;

if (content.includes('animation: infiniteSpinLb 15s linear infinite;')) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/LogoBanner.tsx', content);
  console.log("Successfully patched src/components/LogoBanner.tsx");
} else {
  console.log("Could not find the target string.");
}
