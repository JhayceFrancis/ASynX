import re

with open('src/components/SyncMatrixView.tsx', 'r') as f:
    content = f.read()

old_style = """  const getPanelStyle = (id: string) => {
    const p = layout.find(l => l.i === id);
    if (!p) return {};
    return {
      fontFamily: p.fontFamily || 'inherit',
      fontSize: p.fontSize === 'sm' ? '0.875rem' : p.fontSize === 'lg' ? '1.125rem' : '1rem',
      fontStyle: p.fontStyle === 'italic' ? 'italic' : 'normal',
      fontWeight: p.fontStyle === 'bold' ? 'bold' : 'normal',
      color: p.textColor || 'inherit'
    };
  };"""

new_style = """  const getPanelStyle = (id: string) => {
    const p = layout.find(l => l.i === id);
    if (!p) return {};
    return {
      '--panel-font-family': p.fontFamily || 'inherit',
      '--panel-font-size': p.fontSize === 'sm' ? '0.875rem' : p.fontSize === 'lg' ? '1.125rem' : '1rem',
      '--panel-font-style': p.fontStyle === 'italic' ? 'italic' : 'normal',
      '--panel-font-weight': p.fontStyle === 'bold' ? 'bold' : 'normal',
      '--panel-text-color': p.textColor || 'inherit',
      fontFamily: 'var(--panel-font-family)',
      fontSize: 'var(--panel-font-size)',
      fontStyle: 'var(--panel-font-style)',
      fontWeight: 'var(--panel-font-weight)',
      color: 'var(--panel-text-color)'
    } as any;
  };"""

content = content.replace(old_style, new_style)

with open('src/components/SyncMatrixView.tsx', 'w') as f:
    f.write(content)
