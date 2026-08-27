import re

with open('src/components/Win11TitleBar.tsx', 'r') as f:
    content = f.read()

# Remove the Health Indicators block
health_pattern = r'\{\/\* Health Indicators \*\/\}.*?</div>\s*\{\/\* Windows Controls \*\/\}'
content = re.sub(health_pattern, '{/* Windows Controls */}', content, flags=re.DOTALL)

with open('src/components/Win11TitleBar.tsx', 'w') as f:
    f.write(content)
