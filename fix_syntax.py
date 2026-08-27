import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# Remove the broken `)}\n      {layout.some`
content = content.replace(')}\n      {layout.some(l => l.i === "recent") && (<div key="recent"', '{layout.some(l => l.i === "recent") && (<div key="recent"')
content = content.replace(')}\n      {layout.some(l => l.i === "historical") && (<div key="historical"', '{layout.some(l => l.i === "historical") && (<div key="historical"')
content = content.replace(')}\n      {layout.some(l => l.i === "library") && (<div key="library"', '{layout.some(l => l.i === "library") && (<div key="library"')
content = content.replace(')}\n      {layout.some(l => l.i === "sidelog") && (<div key="sidelog"', '{layout.some(l => l.i === "sidelog") && (<div key="sidelog"')
content = content.replace(')}\n      </ResponsiveGridLayout>', '</ResponsiveGridLayout>')

# Now let's place `)}` correctly AFTER the `</div>` for each section.

# 1. Metrics section ends right before `      {/* SUMMARY CARD: 5 Most Recent Sync Events */}`
content = content.replace('      </div>\n\n      {/* SUMMARY CARD: 5 Most Recent Sync Events */}', '      </div>\n      )}\n\n      {/* SUMMARY CARD: 5 Most Recent Sync Events */}')

# 2. Recent section ends right before `      {/* SYNC PERFORMANCE LINE CHART */}`
content = content.replace('        </div>\n      </div>\n\n      {/* SYNC PERFORMANCE LINE CHART */}', '        </div>\n      </div>\n      )}\n\n      {/* SYNC PERFORMANCE LINE CHART */}')

# 3. Historical section ends right before `      {/* Library View */}`
content = content.replace('        </div>\n      </div>\n\n      {/* Library View */}', '        </div>\n      </div>\n      )}\n\n      {/* Library View */}')

# 4. Library section ends right before `      {/* SIDELOG: Right Column System Status */}`
content = content.replace('        </div>\n      </div>\n\n      {/* SIDELOG: Right Column System Status */}', '        </div>\n      </div>\n      )}\n\n      {/* SIDELOG: Right Column System Status */}')

# 5. Sidelog section ends right before `      </ResponsiveGridLayout>`
content = content.replace('          </div>\n        </div>\n      </ResponsiveGridLayout>', '          </div>\n        </div>\n      )}\n      </ResponsiveGridLayout>')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)

