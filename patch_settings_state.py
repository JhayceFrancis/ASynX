import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const [importQueue, setImportQueue] = useState<ImportQueueItem[]>([]);",
    "const [importQueue, setImportQueue] = useState<ImportQueueItem[]>([]);\n  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);\n  const [testResults, setTestResults] = useState<Record<string, any>>({});"
)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
