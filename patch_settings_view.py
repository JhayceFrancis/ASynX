import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("setFormState(settings); // revert to original props", "// setFormState(settings); // Removed so user doesn't lose what they typed on error")

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
