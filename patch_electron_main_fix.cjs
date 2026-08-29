const fs = require('fs');
let content = fs.readFileSync('electron-main.js', 'utf8');

// The messed up part
const messedUpPart = `      if (scrobbleManager.isEnabled !== isEnabled) {
        scrobbleManager.isEnabled = isEnabled;
        if (!isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.stop();
        } else if (isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.start(3000);
        }
      }

      if (msg.settings.remoteSync) {
        scrobbleManager.updateHubSettings(msg.settings.remoteSync);
      } else if (isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.start(3000);
        }
      }
    }`;

const fixedPart = `      if (scrobbleManager.isEnabled !== isEnabled) {
        scrobbleManager.isEnabled = isEnabled;
        if (!isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.stop();
        } else if (isEnabled && scrobbleManager.activeService) {
           scrobbleManager.activeService.start(3000);
        }
      }

      if (msg.settings.remoteSync) {
        scrobbleManager.updateHubSettings(msg.settings.remoteSync);
      }
    }`;

content = content.replace(messedUpPart, fixedPart);
fs.writeFileSync('electron-main.js', content);
