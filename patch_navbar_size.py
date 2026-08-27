import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace('<ASynXLogo size={32}', '<ASynXLogo size={64}')

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

print("Patched Navbar.tsx size")
