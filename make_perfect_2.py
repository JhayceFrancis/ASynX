with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# Replace the closing `</div>` right before the comments with `</SortablePanel> )}`
content = content.replace('      </div>\n      {/* SUMMARY CARD', '      </div>\n</SortablePanel>\n)}\n      {/* SUMMARY CARD')
content = content.replace('      </div>\n      {/* DASHBOARD', '      </div>\n</SortablePanel>\n)}\n      {/* DASHBOARD')
content = content.replace('      </div>\n      {/* Main Table', '      </div>\n</SortablePanel>\n)}\n      {/* Main Table')
content = content.replace('      </div>\n        {/* Side Log', '      </div>\n</SortablePanel>\n)}\n        {/* Side Log')

# Fix the end of sidelog which is right before `</React.Fragment>`
content = content.replace('      </div>\n                </React.Fragment>', '      </div>\n</SortablePanel>\n)}\n                </React.Fragment>')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
