with open('src/services/OAuthService.ts', 'r') as f:
    content = f.read()

content = content.replace("accessToken: token, connected: false", "accessToken: token, connected: true")

with open('src/services/OAuthService.ts', 'w') as f:
    f.write(content)
