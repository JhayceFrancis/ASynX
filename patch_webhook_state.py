import re
with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const [testResults, setTestResults] = useState<Record<string, any>>({});",
    "const [testResults, setTestResults] = useState<Record<string, any>>({});\n  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);\n  const [webhookTestResults, setWebhookTestResults] = useState<Record<string, any>>({});"
)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
