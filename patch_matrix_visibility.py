import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

# Conditionally render sections if they are in the layout
content = content.replace('<div key="metrics"', '{layout.some(l => l.i === "metrics") && (<div key="metrics"')
content = content.replace('      <div key="recent"', '      {layout.some(l => l.i === "recent") && (<div key="recent"')
content = content.replace('      <div key="historical"', '      {layout.some(l => l.i === "historical") && (<div key="historical"')
content = content.replace('      <div key="library"', '      {layout.some(l => l.i === "library") && (<div key="library"')
content = content.replace('      <div key="sidelog"', '      {layout.some(l => l.i === "sidelog") && (<div key="sidelog"')

# Add closing tags
content = content.replace('      {/* Metrics Row */}', '')

def append_closing(key_match):
    # Find the closing tag by searching for the next key or end of RGL
    pass

# A simpler way to add the closing parenthesis:
# We know the approximate structure, but regex is risky for nested divs.
# I'll just use a small Python script to balance tags.
