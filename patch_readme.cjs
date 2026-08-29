const fs = require('fs');
let readme = fs.readFileSync('README.md', 'utf8');

const ciCdSection = `
## 🤖 GitHub Actions CI/CD Pipeline

ASynX is equipped with robust GitHub Actions workflows for automated releases:

- **Auto-Versioning**: Pushing to \`main\` automatically increments the patch version in \`package.json\` and \`public/manifest.json\`.
- **Windows Executable (Electron)**: Builds the Windows installer \`.exe\` and uploads it to GitHub Releases.
- **Docker GHCR (Linux)**: Builds the Docker image and publishes it to GitHub Container Registry (\`ghcr.io\`).
- **Browser Extension**: Packages the extension \`asynx-browser-extension.zip\` and attaches it to tags.
- **CodeQL**: Automated security analysis running on PRs and a weekly cron schedule.

**Configuration:**
Ensure Actions have Read/Write permissions: \`Settings > Actions > General > Workflow permissions > Read and write permissions\`.

`;

// Insert it before the License section
readme = readme.replace('## 📄 License', ciCdSection + '## 📄 License');
fs.writeFileSync('README.md', readme);
console.log("Patched README.md");
