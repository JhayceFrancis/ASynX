import re
with open('src/types.ts', 'r') as f:
    content = f.read()

pattern = r'export interface PanelConfig \{([^}]+)\}'
replacement = r'''export interface PanelConfig {\1
  bgGradient?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontStyle?: string;
  customSize?: 'landscape' | 'portrait' | 'square' | 'wide' | 'tall' | 'custom';
}'''

new_content = re.sub(pattern, replacement, content)

with open('src/types.ts', 'w') as f:
    f.write(new_content)
