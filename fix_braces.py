import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'      \}\n(\s*\{/\* SUMMARY CARD)', r'      )}\n\1', content)
content = re.sub(r'      \}\n(\s*\{/\* DASHBOARD VISUALIZATION)', r'      )}\n\1', content)
content = re.sub(r'      \}\n(\s*\{/\* Main Table)', r'      )}\n\1', content)
content = re.sub(r'      \}\n(\s*\{/\* Side Log)', r'      )}\n\1', content)
content = re.sub(r'      \}\n(\s*</SortablePanel>)', r'      )}\n\1', content)

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
