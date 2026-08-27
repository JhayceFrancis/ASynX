import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Fix Karakeep
content = re.sub(
    r'(Provide this URL in your KaraKeep settings so ASynX can receive watch updates\.</p></div>\s*</div>)(\s*\)}\s*</div>\s*</div>\s*{/\* Section 5)',
    r'\1\n              </div>\2',
    content
)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
