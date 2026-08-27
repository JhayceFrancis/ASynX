import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Replace AnimatedASynXBanner props to remove themeToggleNode and syncButtonNode
content = re.sub(r'themeToggleNode=\{isScrolled \? themeToggleNode : null\}', '', content)
content = re.sub(r'syncButtonNode=\{isScrolled \? syncButtonNode : null\}', '', content)

# Remove the old top right section for !isScrolled
content = re.sub(r'\{\!isScrolled && \(\s*<div className="flex items-center space-x-2\.5">\s*\{themeToggleNode\}\s*\{syncButtonNode\}\s*</div>\s*\)\}', '', content)

# Remove the status badges section entirely
content = re.sub(r'<div className="hidden xl:flex items-center space-x-2 bg-gray-50/50 dark:bg-\[\#111\]/50 px-2 py-1 rounded-xl text-xs flex-shrink-0 backdrop-blur-md">.*?</div>', '', content, flags=re.DOTALL)

# Insert the themeToggleNode and syncButtonNode next to the nav buttons
replacement = r"""            <nav className="flex items-center space-x-1 flex-shrink-0">
\1
            </nav>
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-neutral-700">
              {themeToggleNode}
              {syncButtonNode}
            </div>"""

content = re.sub(r'<nav className="flex items-center space-x-1 flex-shrink-0">(.*?)</nav>', replacement, content, flags=re.DOTALL)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
print("Patched Navbar")
