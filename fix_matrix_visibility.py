import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# I will replace `<div key="metrics" className={`w-full h-full group relative rounded-2xl ${getPanelClass('metrics', '')}`} style={getPanelStyle('metrics')}>`
# with `{layout.some(l => l.i === 'metrics') && (<div key="metrics"...`

for key in ['metrics', 'recent', 'historical', 'library', 'sidelog']:
    search_str = f'<div key="{key}" className={{`w-full h-full'
    replace_str = f'{{layout.some(l => l.i === "{key}") && (<div key="{key}" className={{`w-full h-full'
    
    # We also need to add the closing parenthesis `)}`
    # Let's find the closing `</div>` for these specific sections.
    # Actually, it's easier to just do it via exact string matching for the ending because each block is followed by the next one.
    
    content = content.replace(search_str, replace_str)

# Metrics ends before `<div key="recent"`
content = content.replace('{layout.some(l => l.i === "recent")', ')}\n      {layout.some(l => l.i === "recent")')

# Recent ends before `<div key="historical"`
content = content.replace('{layout.some(l => l.i === "historical")', ')}\n      {layout.some(l => l.i === "historical")')

# Historical ends before `<div key="library"`
content = content.replace('{layout.some(l => l.i === "library")', ')}\n      {layout.some(l => l.i === "library")')

# Library ends before `<div key="sidelog"`
content = content.replace('{layout.some(l => l.i === "sidelog")', ')}\n      {layout.some(l => l.i === "sidelog")')

# Sidelog ends before `</ResponsiveGridLayout>`
content = content.replace('</ResponsiveGridLayout>', ')}\n      </ResponsiveGridLayout>')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
