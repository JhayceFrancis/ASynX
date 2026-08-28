import re

with open('src/components/ExtensionCompanionView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The first occurrence is around line 112, let's remove it if it exists inside the header banner or right after it.
# We'll just split on `{/* Navigation Tabs */}`
parts = content.split('{/* Navigation Tabs */}')
if len(parts) > 2:
    # It was inserted twice! Let's keep only the first one, or the one in the correct place.
    # Where should it be? Right before `{activeTab === 'simulator' && (`
    pass

# Actually, the simplest way is to rewrite the component structure clearly.
