# ASynX — Cross-Platform Anime & Drama Sync Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-00cec9.svg?style=for-the-badge&labelColor=09090b)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/JhayceFrancis/ASynX?style=for-the-badge&color=00cec9&labelColor=09090b)](https://github.com/JhayceFrancis/ASynX/releases/latest)
[![Build Status](https://img.shields.io/badge/Build-Passing-00cec9.svg?style=for-the-badge&labelColor=09090b)](https://github.com/JhayceFrancis/ASynX/actions)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20Docker%20%7C%20Browser%20Plugin-00cec9.svg?style=for-the-badge&labelColor=09090b)]()

**ASynX** is an open-source, offline-first, AES-256-GCM encrypted media tracking suite designed to bridge your local media servers (Plex, Tautulli) with cloud tracking platforms (Simkl, MyAnimeList, AniList). 

Packed into a modern Windows 11 Fluent dark-themed UI, ASynX acts as your unified source of truth for Anime and Drama progress.

---

## 🌟 Key Features

### 🎨 Visual & Desktop Interface
- **Windows 11 Native Aesthetic**: Custom Windows 11 title bar and status bar wrapper with dark/light theme switching.
- **Interactive Tooltips**: High-visibility hover captions and descriptions across all tabs, status badges, and action controls.
- **Sync Matrix & Analytics**: High-density grid and table views with progress bars, conflict flags, manual overrides, and activity graphs (powered by Recharts).


### 🛠️ Advanced Customization & Real-Time Telemetry
- **Dynamic Theme Engine**: Personalize your experience with full color palette controls. Customize primary/accent colors, button states, header backgrounds, layout padding scalars, and complex multi-color radial or linear gradients.
- **System Health Dashboard**: Monitor real-time status, API ping latency, and memory usage for external integrations (Simkl, MAL, AniList) and internal services (Plex, Tautulli, Jellyfin, Emby).
- **Expanded Media Taxonomy**: Full categorization support including *Anime TV Series*, *Anime Film*, *Anime Special*, *Drama*, *TV Series*, and *Film* with automated fallback logic for legacy CSV/HTML imports.
- **Bulk Action Modals**: Intuitive mass-synchronization controls (e.g. 'Sync All Selected' vs 'Only Resolve Conflicts').
- **WebSocket Reactivity**: UI instantly reacts and updates progress charts when a remote Plex/Tautulli webhook scrobbles an episode, backed by a deduplication playback session manager.



### 🔒 Security & GDPR Compliance
- **IDP Auto-Sync**: Seamlessly connect your Google/GitHub identity to securely handshake API keys between your Windows Desktop, Docker daemon, and Browser Plugin.
- **Encryption at Rest**: Locally supplied Personally Identifiable Information (PII) like email addresses are AES-encrypted before resting in local JSON DBs, adhering to EU GDPR practices.
- **Encrypted Payloads**: Secure webhook deliveries over HTTPS when syncing between browser extension modules and your desktop ASynX server.

### ⚡ Intelligent Workflow & Notifications
- **Smart Resolve (AI)**: Leverage Gemini/OpenAI models to automatically analyze metadata, watch history, and episode discrepancies, presenting a one-click optimal resolution.
- **Floating Bulk Actions Toolbar**: Check multiple items in the Sync Matrix and quickly apply mass actions (Force Sync, Mark as Watched, Ignore Conflicts) from a non-intrusive floating command bar.
- **Drag-and-Drop Sync Scheduler**: A dedicated calendar timeline view allowing users to visually adjust background automation tasks, frequencies, and execution times using a seamless drag-and-drop interface.
- **Push Notifications & Webhooks**: Integrated real-time notifications for sync successes, errors, and conflicts. Supports Desktop/Browser Native notifications, Discord Webhooks, Apprise, and Pushbullet.

### 🔄 Multi-Platform Sync & Automation
- **Unified Trackers**: Sync watch status, current episode, and ratings across **Simkl**, **MyAnimeList**, and **AniList**.
- **Plex & Tautulli Webhook Listener**: Automatically scrobble episodes when your stream reaches configurable watch thresholds (e.g. 80%).
- **Standalone Docker Sync Daemon**: Background sync service running in the Express backend container that synchronizes accounts on a schedule (e.g., every 15 minutes) even when the browser or UI is closed.
- **AI Conflict Resolution**: Gemini AI integration to automatically evaluate desynced episode numbers and title naming discrepancies.
- **Data Import & Backups**: Import watch histories from JSON, CSV, or scraped HTML tables, and push automated backups to GitHub Gists.

### 🔒 Privacy & Open Source Security
- **No Plaintext Token Leaks**: API credentials, OAuth tokens, and secret keys are stored in an AES-256-GCM encrypted database (`asynx_data.enc`).
- **Masked Password Inputs**: Sensitive token inputs in the UI use masked password fields.
- **Environment Variable Overrides**: All API keys, ports, and server options can be passed via `.env` or container environment variables without modifying source code.
- **100% Open Source (MIT License)**: Safe for public distribution, fork, and self-hosting.

---
## 📖 Documentation & Wiki

For comprehensive guides, advanced configurations, and troubleshooting, please visit the official [ASynX Wiki](https://github.com/JhayceFrancis/ASynX/wiki). 

If you prefer to read or contribute to the documentation offline, you can clone the wiki repository locally to your machine:
```bash
git clone [https://github.com/JhayceFrancis/ASynX.wiki.git](https://github.com/JhayceFrancis/ASynX.wiki.git)
```

---

## 
## Screenshots of Windows 11 App
<details>
<summary>🖼️ <b>Click to view application gallery</b></summary>
<br>

| Sync Matrix & Dashboard (Cyberpunk Black Mode) | Sync Matrix & Dashboard (Light Mode) |
| :---: | :---: |
| <img width="100%" src="https://github.com/user-attachments/assets/47f1e632-902f-43a0-93f0-899697cc670c" alt="ASynX App Dashboard in Cyberpunk Black Theme"> | <img width="100%" src="https://github.com/user-attachments/assets/1d02b51c-2046-4036-ab53-f355194ce521" alt="ASynX Dashboard in Light Theme"> |
| **Conflict Resolution Tab** | **Plex Media Server & Tautulli Automation Suite** |
| <img width="100%" src="https://github.com/user-attachments/assets/4fdd84d4-aed0-40a7-8c05-085d89f60e53" alt="ASynX Resolve mismatches between Simkl, MAL, and AniList."> | <img width="100%" src="https://github.com/user-attachments/assets/efe9a74b-497e-4f7c-b974-4b1436f822c3" alt="ASynX Plex & Tautulli Webhooks"> |
| **Browser Plugin Companion** | **Settings, Remote, & Credentials** |
| <img width="100%" src="https://github.com/user-attachments/assets/a9eef8b4-dbdf-4672-930b-957b17f090a4" alt="ASynX Browser Plugin Companion"> | <img width="100%" src="https://github.com/user-attachments/assets/59da8753-9a6c-4507-97ca-8e6cdf916eb8" alt="ASynX Settings, Remote Docker Configurator & API Keys"> |

</details>

---


## 🤖 GitHub Actions CI/CD Pipeline

ASynX is equipped with robust GitHub Actions workflows for automated releases:

- **Auto-Versioning**: Pushing to `main` automatically increments the patch version in `package.json` and `public/manifest.json`.
- **Windows Executable (Electron)**: Builds the Windows installer `.exe` and uploads it to GitHub Releases.
- **Docker GHCR (Linux)**: Builds the Docker image and publishes it to GitHub Container Registry (`ghcr.io`).
- **Browser Extension**: Packages the extension `asynx-browser-extension.zip` and attaches it to tags.
- **CodeQL**: Automated security analysis running on PRs and a weekly cron schedule.

**Configuration:**
Ensure Actions have Read/Write permissions: `Settings > Actions > General > Workflow permissions > Read and write permissions`.

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.


## 🚀 Installation & Deployment

ASynX is built for multiple deployment methods depending on your tracking needs:

### 1. Windows Desktop App (Electron)
- **Installer**: Download the `.exe` from [GitHub Releases](https://github.com/asynx/releases).
- **Microsoft Store**: (Coming Soon)
- **Build From Source**:
  ```bash
  git clone https://github.com/asynx/asynx.git
  npm ci
  npm run make
  ```

### 2. Docker Daemon (Headless Syncing)
Keep your Webhooks processing 24/7 without keeping your PC running.
```yaml
version: '3.8'
services:
  asynx-backend:
    image: asynx/backend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your_secure_secret
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### 3. Browser Extension Plugin
Intercept video streams on Crunchyroll, Netflix, and HiDive directly from the web and route them to ASynX.
- Go to our **GitHub Releases** page and download `asynx-browser-extension.zip`.
- Extract it, go to `chrome://extensions` in Chromium browsers, enable **Developer Mode**, and **Load Unpacked**.
- Click the plugin icon, enter your Docker/Desktop API Key, and enable **IDP Auto-Sync**.

