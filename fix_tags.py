with open('src/components/Navbar.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for idx, line in enumerate(lines):
    new_lines.append(line)
    if 'tabTitleNode={isScrolled ? activeTabNode : null}' in line:
        new_lines.append('              />\n')
        new_lines.append('            </div>\n')
        new_lines.append('          </Tooltip>\n')
        new_lines.append('        </div>\n')
        new_lines.append('      </div>\n')
        new_lines.append('    </div>\n')
        
        # skip lines until the next section
        break

# Find where to resume
resume_idx = -1
for i in range(idx+1, len(lines)):
    if '<div className="flex items-center space-x-4 ml-auto">' in lines[i]:
        resume_idx = i
        break

if resume_idx != -1:
    new_lines.extend(lines[resume_idx:])

with open('src/components/Navbar.tsx', 'w') as f:
    f.writelines(new_lines)
