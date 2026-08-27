import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("Keyboard,\n  Trash2", "Keyboard")
content = content.replace("Keyboard", "Keyboard,\n  Trash2", 1) # Only replace the first occurrence (in imports)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
