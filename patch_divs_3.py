import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Fix Jellyfin
content = re.sub(
    r'(<input[^>]+Jellyfin API Token[^>]+>\s*</div>\s*</div>)(\s*\)}\s*</div>\s*{/\* Emby \*/})',
    r'\1\n                </div>\2',
    content
)

# Fix Emby
content = re.sub(
    r'(<input[^>]+Emby API Token[^>]+>\s*</div>\s*</div>)(\s*\)}\s*</div>\s*</div>\s*</div>\s*{/\* Section 6)',
    r'\1\n                </div>\2',
    content
)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
