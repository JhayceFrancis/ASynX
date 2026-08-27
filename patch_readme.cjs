const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf8');

const newFeatures = `
### ⚡ Intelligent Workflow & Notifications
- **Smart Resolve (AI)**: Leverage Gemini/OpenAI models to automatically analyze metadata, watch history, and episode discrepancies, presenting a one-click optimal resolution.
- **Floating Bulk Actions Toolbar**: Check multiple items in the Sync Matrix and quickly apply mass actions (Force Sync, Mark as Watched, Ignore Conflicts) from a non-intrusive floating command bar.
- **Drag-and-Drop Sync Scheduler**: A dedicated calendar timeline view allowing users to visually adjust background automation tasks, frequencies, and execution times using a seamless drag-and-drop interface.
- **Push Notifications & Webhooks**: Integrated real-time notifications for sync successes, errors, and conflicts. Supports Desktop/Browser Native notifications, Discord Webhooks, Apprise, and Pushbullet.`;

content = content.replace("### 🔄 Multi-Platform Sync & Automation", newFeatures + "\\n\\n### 🔄 Multi-Platform Sync & Automation");

fs.writeFileSync('README.md', content);
