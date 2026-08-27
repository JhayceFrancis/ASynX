with open('electron-main.js', 'r') as f:
    content = f.read()

content = content.replace("// Prevent rendering glitches on integrated graphics\napp.disableHardwareAcceleration();\n\n// Prevent rendering glitches on integrated graphics\napp.disableHardwareAcceleration();", "// Prevent rendering glitches on integrated graphics\napp.disableHardwareAcceleration();")

with open('electron-main.js', 'w') as f:
    f.write(content)
