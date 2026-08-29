const fs = require('fs');
const file = 'electron-main.js';
let content = fs.readFileSync(file, 'utf8');

const settingsUpdateLogic = `
    if (msg && msg.type === 'settings-updated' && scrobbleManager) {
      const daemonSettings = msg.settings.daemonSettings || {};
      const newRules = {
        ignorePaths: daemonSettings.scrobbleRules?.['MPC-BE']?.ignorePaths || [],
        completionThreshold: daemonSettings.scrobbleRules?.['MPC-BE']?.completionThreshold || 0.8
      };
      
      // Update rules directly on the manager's ruleEngine
      if (scrobbleManager.ruleEngine) {
        scrobbleManager.ruleEngine.ignorePaths = newRules.ignorePaths;
        scrobbleManager.ruleEngine.completionThreshold = newRules.completionThreshold;
      }
      
      // Update enabled state if it changed
      const isEnabled = !msg.settings.maintenanceMode; // Global pause logic
      
      if (scrobbleManager.isEnabled !== isEnabled) {
        scrobbleManager.isEnabled = isEnabled;
        if (!isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.stop();
        } else if (isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.start(3000);
        }
      }
    }
`;

content = content.replace("createWindow(msg.port);\n    }", "createWindow(msg.port);\n    }\n" + settingsUpdateLogic);

fs.writeFileSync(file, content);
console.log("Patched electron-main.js");
