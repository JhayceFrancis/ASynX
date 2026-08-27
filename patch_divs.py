import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Jellyfin closing
content = re.sub(
    r'(\s*</div>\n\s*)}\n\s*</div>\n\s*{/\* Emby \*/})',
    r'</div>\1',
    content
)

# Emby closing
content = re.sub(
    r'(\s*</div>\n\s*)}\n\s*</div>\n\s*{/\* Tautulli \*/})',
    r'</div>\1',
    content
)

# Karakeep closing
content = re.sub(
    r'(\s*</div>\n\s*</div>\n\s*)}\n\s*</div>\n\s*</div>\n\s*{/\* Section 5: Media Servers & Scrobbler \*/})',
    r'</div>\1',
    content
)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
