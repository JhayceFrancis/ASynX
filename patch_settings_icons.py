import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("Trash2", "Trash2,\n  Activity")

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
