import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# 1. Remove the opening parenthesis
content = content.replace('&& (<div key="metrics"', '&& <div key="metrics"')
content = content.replace('&& (<div key="recent"', '&& <div key="recent"')
content = content.replace('&& (<div key="historical"', '&& <div key="historical"')
content = content.replace('&& (<div key="library"', '&& <div key="library"')
content = content.replace('&& (<div key="sidelog"', '&& <div key="sidelog"')

# 2. Change the stray `)}` back to `}`
# Since I added them specifically, I'll find them and fix them.

content = content.replace('      </div>\n      )}\n', '      </div>\n      }\n')
content = content.replace('        </div>\n      </div>\n      )}\n', '        </div>\n      </div>\n      }\n')
content = content.replace('          </div>\n        </div>\n      )}\n', '          </div>\n        </div>\n      }\n')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)

