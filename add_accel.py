with open('electron-main.js', 'r') as f:
    content = f.read()

# I want to insert app.disableHardwareAcceleration(); right after if (require('electron-squirrel-startup')) { app.quit(); }
content = content.replace("if (require('electron-squirrel-startup')) {\n  app.quit();\n}", "if (require('electron-squirrel-startup')) {\n  app.quit();\n}\n\n// Prevent rendering glitches on integrated graphics\napp.disableHardwareAcceleration();")

with open('electron-main.js', 'w') as f:
    f.write(content)
