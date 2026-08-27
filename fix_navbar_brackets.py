import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace('{{settings?.nexusTabName || \'Bookmarks\'}}', '{settings?.nexusTabName || \'Bookmarks\'}')
content = content.replace('{{isEditMode ? "Exit Layout Edit Mode" : "Customize Tab Layout"}}', '{isEditMode ? "Exit Layout Edit Mode" : "Customize Tab Layout"}')

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
