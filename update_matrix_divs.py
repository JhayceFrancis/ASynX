import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# Apply to 'metrics'
content = content.replace('<div key="metrics" className="w-full h-full">', '''<div key="metrics" className={`w-full h-full group relative rounded-2xl ${getPanelClass('metrics', '')}`} style={getPanelStyle('metrics')}>
  {renderEditToolbar('metrics')}
  {renderCustomizer('metrics')}''')

# Apply to 'recent'
content = content.replace('<div key="recent" className="w-full h-full">', '''<div key="recent" className={`w-full h-full group relative rounded-2xl ${getPanelClass('recent', '')}`} style={getPanelStyle('recent')}>
  {renderEditToolbar('recent')}
  {renderCustomizer('recent')}''')

# Apply to 'historical'
content = content.replace('<div key="historical" className="w-full h-full">', '''<div key="historical" className={`w-full h-full group relative rounded-2xl ${getPanelClass('historical', '')}`} style={getPanelStyle('historical')}>
  {renderEditToolbar('historical')}
  {renderCustomizer('historical')}''')

# Apply to 'library'
content = content.replace('<div key="library" className="w-full h-full overflow-hidden flex flex-col space-y-4 min-w-0">', '''<div key="library" className={`w-full h-full overflow-hidden flex flex-col space-y-4 min-w-0 group relative rounded-2xl ${getPanelClass('library', '')}`} style={getPanelStyle('library')}>
  {renderEditToolbar('library')}
  {renderCustomizer('library')}''')

# Apply to 'sidelog'
content = content.replace('<div key="sidelog" className="w-full h-full overflow-hidden space-y-4">', '''<div key="sidelog" className={`w-full h-full overflow-hidden space-y-4 group relative rounded-2xl ${getPanelClass('sidelog', '')}`} style={getPanelStyle('sidelog')}>
  {renderEditToolbar('sidelog')}
  {renderCustomizer('sidelog')}''')

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
