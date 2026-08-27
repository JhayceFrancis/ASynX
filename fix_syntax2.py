import re
with open("src/components/SyncMatrixView.tsx", "r") as f:
    content = f.read()

# Replace the specific malformed block
content = re.sub(r'\s*}\n\s*\)\}\n\s*</div>', '\n          )}\n        </div>', content)

with open("src/components/SyncMatrixView.tsx", "w") as f:
    f.write(content)
