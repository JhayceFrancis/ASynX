import re

def remove_unused(filepath, unused_vars):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for var in unused_vars:
        if var == "purgedCount":
            content = re.sub(r'let\s+purgedCount\s*=\s*0;', '', content)
            content = re.sub(r'purgedCount\+\+;', '', content)
        elif var == "result":
            content = re.sub(r'const\s+result\s*=\s*await\s+response\.json\(\);', 'await response.json();', content)
        elif var == "mediaType":
            content = re.sub(r'const\s+mediaType\s*=\s*item\.platforms\[platformType\]\?\.mediaType\s*\|\|\s*"anime";', '', content)
        elif var == "SyncScheduleView":
            content = re.sub(r'import\s+SyncScheduleView.*?\n', '', content)
        elif var == "ScrobblePrompt":
            content = re.sub(r'import\s+ScrobblePrompt.*?\n', '', content)
        elif var == "extStateData":
            content = re.sub(r',\s*extStateData', '', content)
        elif var == "itemId":
            content = re.sub(r'const\s+itemId\s*=\s*e\.dataTransfer\.getData\("text/plain"\);', '', content)
        elif var == "allLayouts":
            content = re.sub(r'const\s+allLayouts\s*=\s*layouts;', '', content)
        elif var == "extensionState":
            content = re.sub(r',\s*extensionState', '', content)
        elif var == "themeToggleNode":
            content = re.sub(r'const\s+themeToggleNode\s*=\s*document\.querySelector.*?;\n', '', content)
        elif var == "setCopiedKarakeep":
            content = re.sub(r'const\s+\[copiedKarakeep,\s*setCopiedKarakeep\]\s*=\s*useState\(false\);', '', content)
        elif var == "setTestDevice":
            content = re.sub(r'const\s+\[testDevice,\s*setTestDevice\]\s*=\s*useState\(""\);', '', content)
        elif var == "testingRuleId":
            content = re.sub(r'const\s+\[testingRuleId,\s*testingRuleId\]\s*=\s*useState\(null\);', '', content)
            content = re.sub(r'const\s+\[testingRuleId,\s*setTestingRuleId\]\s*=\s*useState<string\s*\|\s*null>\(null\);', '', content)
        elif var == "testResults":
            content = re.sub(r'const\s+\[testResults,\s*setTestResults\]\s*=\s*useState<any>\(null\);', '', content)
        elif var == "handleTestRule":
            content = re.sub(r'const\s+handleTestRule\s*=\s*async\s*\(ruleId:\s*string\)\s*=>\s*\{.*?\}', '', content, flags=re.DOTALL)
        elif var == "ResponsiveGridLayout":
            content = re.sub(r'const\s+ResponsiveGridLayout\s*=\s*WidthProvider\(Responsive\);', '', content)
        elif var == "onImportCSV":
            content = re.sub(r'const\s+onImportCSV\s*=\s*\(e.*?\{.*?\}', '', content, flags=re.DOTALL)
        elif var == "notifications":
            content = re.sub(r'const\s+\[notifications,\s*setNotifications\]\s*=\s*useState.*?;\n', '', content)
        elif var == "handleLayoutChange":
            content = re.sub(r'const\s+handleLayoutChange\s*=\s*\(.*?\{.*?\}', '', content, flags=re.DOTALL)
        elif var == "index":
            content = re.sub(r',\s*index', '', content)
        elif var == "settings":
            content = re.sub(r'const\s+\[settings,\s*setSettings\]\s*=\s*useState.*?;\n', '', content)
        elif var == "setActiveTab":
            content = re.sub(r',\s*setActiveTab', '', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

remove_unused('server.ts', ['purgedCount', 'result', 'mediaType'])
remove_unused('src/App.tsx', ['SyncScheduleView', 'ScrobblePrompt', 'extStateData', 'itemId'])
remove_unused('src/components/GridLayoutEngine.tsx', ['allLayouts'])
remove_unused('src/components/Navbar.tsx', ['extensionState', 'themeToggleNode'])
remove_unused('src/components/PlexWebhookView.tsx', ['setCopiedKarakeep', 'setTestDevice'])
remove_unused('src/components/SettingsView.tsx', ['testingRuleId', 'testResults', 'handleTestRule'])
remove_unused('src/components/SyncMatrixView.tsx', ['ResponsiveGridLayout', 'onImportCSV', 'notifications', 'handleLayoutChange'])
remove_unused('src/components/SystemHealthView.tsx', ['index'])
remove_unused('src/components/Win11TitleBar.tsx', ['settings', 'setActiveTab'])

print("Vars removed")
