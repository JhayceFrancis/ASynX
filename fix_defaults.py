import re

with open('server.ts', 'r') as f:
    content = f.read()

# Replace connected: true with connected: false in defaultSettings
content = re.sub(
    r'(simkl: \{[^\}]*?)connected: true,',
    r'\1connected: false,',
    content
)
content = re.sub(
    r'(mal: \{[^\}]*?)connected: true,',
    r'\1connected: false,',
    content
)
content = re.sub(
    r'(anilist: \{[^\}]*?)connected: true,',
    r'\1connected: false,',
    content
)
content = re.sub(
    r'(plex: \{[^\}]*?)connected: true,',
    r'\1connected: false,',
    content
)

with open('server.ts', 'w') as f:
    f.write(content)
