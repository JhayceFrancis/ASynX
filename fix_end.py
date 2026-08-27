import re

with open('electron-main.js', 'r') as f:
    content = f.read()

# Fix the broken end
content = content.replace("  if (process.platform !== 'darwin' && isQuitting) app.quit();\n}\n\n// Prevent rendering glitches on integrated graphics\napp.disableHardwareAcceleration();\n);", "  if (process.platform !== 'darwin' && isQuitting) app.quit();\n});")

with open('electron-main.js', 'w') as f:
    f.write(content)
