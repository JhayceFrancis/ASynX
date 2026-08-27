import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

content = content.replace('        </div>\n      }\n      \n      {isEditMode && paletteOpen && (', '        </div>\n      )}\n      \n      {isEditMode && paletteOpen && (')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)

