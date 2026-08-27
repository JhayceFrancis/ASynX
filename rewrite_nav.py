import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Replace Tooltips around the nav buttons with just the expanding button
def replace_button(match):
    # match.group(0) is the entire Tooltip block
    # We need to extract the title, the active condition, the icon, the onClick
    
    title_match = re.search(r'title="([^"]+)"', match.group(0))
    if not title_match:
        # Fallback to dynamic title like settings?.nexusTabName || 'Bookmarks'
        title_match = re.search(r'title=\{([^}]+)\}', match.group(0))
        if title_match:
            title = '{' + title_match.group(1) + '}'
        else:
            title = 'Unknown'
    else:
        title = title_match.group(1)
        
    onClick_match = re.search(r'onClick=\{([^}]+)\}', match.group(0))
    onClick = onClick_match.group(1) if onClick_match else '() => {}'
    
    layoutId_match = re.search(r'layoutId="([^"]+)"', match.group(0))
    layoutId = layoutId_match.group(1) if layoutId_match else 'tab'
    
    active_match = re.search(r'activeTab === \'([^\']+)\'', match.group(0))
    activeTab = active_match.group(1) if active_match else ''
    
    # Extract the icon
    icon_match = re.search(r'<([A-Za-z]+)\s+className="w-4 h-4"', match.group(0))
    icon = icon_match.group(1) if icon_match else 'Circle'
    
    # specific condition for conflict count
    if activeTab == 'conflicts':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />\n                    {{conflictCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}}'
        active_class = "activeTab === 'conflicts' ? 'bg-amber-600/20 text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'matrix':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'matrix' ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'performance':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'performance' ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'plex':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'plex' ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'extension':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'extension' ? 'bg-cyan-600/20 text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'settings':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'settings' ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'database':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'database' ? 'bg-gray-200/80 dark:bg-[#111]/80 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'docker-backend':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'docker-backend' ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'health':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'health' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'bookmarks':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'bookmarks' ? 'bg-pink-600/20 text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    elif activeTab == 'api-docs':
        icon_element = f'<{icon} className="w-4 h-4 flex-shrink-0" />'
        active_class = "activeTab === 'api-docs' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
    else:
        # Edit mode / Layout mode buttons
        if 'onToggleEditMode' in match.group(0):
            icon_element = f'<LayoutDashboard className="w-4 h-4 flex-shrink-0" />'
            active_class = "isEditMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
        elif 'onToggleCustomizePanel' in match.group(0):
            icon_element = f'<Palette className="w-4 h-4 flex-shrink-0" />'
            active_class = "isCustomizePanelOpen ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]'"
        else:
            return match.group(0)
    
    if '{' in title and '}' in title:
        title_render = title
    else:
        title_render = f"'{title}'"

    button_str = f"""<motion.button layoutId="{layoutId}" onClick={{{onClick}}} className={{`group relative flex items-center p-1.5 rounded-xl transition-all cursor-pointer overflow-hidden ${{{active_class}}}`}}>
  {icon_element}
  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-active:max-w-[160px] group-hover:opacity-100 group-active:opacity-100 group-hover:ml-1.5 group-active:ml-1.5 transition-all duration-300 whitespace-nowrap text-[11px] font-semibold">
    {{{title_render}}}
  </span>
</motion.button>"""

    return button_str

pattern = r'<Tooltip[^>]+>\s*<motion\.button.*?</motion\.button>\s*</Tooltip>|<Tooltip[^>]+>\s*<button.*?</button>\s*</Tooltip>'

new_content = re.sub(pattern, replace_button, content, flags=re.DOTALL)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(new_content)
