with open('electron-main.js', 'r') as f:
    content = f.read()

content = content.replace('app.disableHardwareAcceleration();\n', '')
content = content.replace("app.quit();\n}", "app.quit();\n}\n\n// Prevent rendering glitches on integrated graphics\napp.disableHardwareAcceleration();\n")

with open('electron-main.js', 'w') as f:
    f.write(content)
