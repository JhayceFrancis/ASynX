with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

content = content.replace("key=metrics", 'key="metrics"')
content = content.replace("key=recent", 'key="recent"')
content = content.replace("key=historical", 'key="historical"')
content = content.replace("key=library", 'key="library"')
content = content.replace("key=sidelog", 'key="sidelog"')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
