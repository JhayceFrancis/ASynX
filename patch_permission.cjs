const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const targetStr = `                  onClick={() => {
                    setFormState({ 
                      ...formState, 
                      pushNotifications: { 
                        ...formState.pushNotifications, 
                        browserNotifications: !formState.pushNotifications?.browserNotifications 
                      } as any 
                    });
                  }}`;

const newStr = `                  onClick={() => {
                    const nextState = !formState.pushNotifications?.browserNotifications;
                    if (nextState && 'Notification' in window) {
                      Notification.requestPermission();
                    }
                    setFormState({ 
                      ...formState, 
                      pushNotifications: { 
                        ...formState.pushNotifications, 
                        browserNotifications: nextState 
                      } as any 
                    });
                  }}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/SettingsView.tsx', code);
  console.log("Added permission request");
}
