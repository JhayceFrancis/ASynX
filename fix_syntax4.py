import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

content = content.replace('        </div>\n      }\n      <ResponsiveGridLayout', '        </div>\n      )}\n      <ResponsiveGridLayout')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)

