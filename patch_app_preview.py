import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add state
content = content.replace(
    "const [showSyncValidation, setShowSyncValidation] = useState(false);",
    "const [showSyncValidation, setShowSyncValidation] = useState(false);\n  const [showSyncPreview, setShowSyncPreview] = useState(false);"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
