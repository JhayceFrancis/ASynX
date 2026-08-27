import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# Replace the closing `</div>` right before the comments with `</SortablePanel> )}`
content = re.sub(r'      </div>\n+\s*\{/\* SUMMARY CARD', r'      </div>\n</SortablePanel>\n)}\n      {/* SUMMARY CARD', content)
content = re.sub(r'      </div>\n+\s*\{/\* DASHBOARD', r'      </div>\n</SortablePanel>\n)}\n      {/* DASHBOARD', content)
content = re.sub(r'      </div>\n+\s*\{/\* Main Table', r'      </div>\n</SortablePanel>\n)}\n      {/* Main Table', content)
content = re.sub(r'      </div>\n+\s*\{/\* Side Log', r'      </div>\n</SortablePanel>\n)}\n        {/* Side Log', content)

# Fix the end of sidelog which is right before `</React.Fragment>`
content = re.sub(r'      </div>\n+\s*</React.Fragment>', r'      </div>\n</SortablePanel>\n)}\n                </React.Fragment>', content)

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
