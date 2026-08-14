# ASynX — Cross-Platform Anime & Drama Sync Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v2.4.0--beta.1-orange.svg)]()
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20Docker-indigo.svg)]()

**ASynX** is an open-source, offline-first, AES-256-GCM encrypted media tracking suite designed to bridge your local media servers (Plex, Tautulli) with cloud tracking platforms (Simkl, MyAnimeList, AniList). 

Packed into a modern Windows 11 Fluent dark-themed UI, ASynX acts as your unified source of truth for Anime and Drama progress.

---

## 🌟 Key Features

### 🎨 Visual & Desktop Interface
- **Windows 11 Native Aesthetic**: Custom Windows 11 title bar and status bar wrapper with dark/light theme switching.
- **Interactive Tooltips**: High-visibility hover captions and descriptions across all tabs, status badges, and action controls.
- **Sync Matrix & Analytics**: High-density grid and table views with progress bars, conflict flags, manual overrides, and activity graphs (powered by Recharts).

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
## ⚙️ Quick Start & Installation
## 💻 Download & Installation Guide (Windows Client)

Follow these steps to download and install the latest version of ASynX for Windows:

### 1. Download the Installer
1. Navigate to the [ASynX Releases page](https://github.com/JhayceFrancis/ASynX/releases) on GitHub.
2. Locate the most recent release, which will be marked with a green **Latest** badge.
3. Scroll to the bottom of the release notes and click to expand the **Assets** dropdown menu.
4. Click on the Windows executable file (e.g., `ASynX Setup 2.4.0-beta.8.exe`) to download the installer directly to your machine.

### 2. Run the Setup
1. Open your Windows **Downloads** folder (or wherever your browser saves downloaded files).
2. Double-click the downloaded `.exe` file to launch the setup process.

### 3. Bypass Windows SmartScreen (If Prompted)
Because ASynX does not currently utilise a paid enterprise code-signing certificate, Windows Defender SmartScreen may temporarily flag the programme as unrecognised upon launching the installer. To proceed securely:
1. Click on the **More info** text link within the blue SmartScreen popup window.
2. A new button will appear at the bottom right. Click **Run anyway** to authorise the installation.

### 4. Launch the Application
1. The installer will automatically unpack the files, configure the required dependencies, and complete the installation without requiring any further input.
2. Once finished, ASynX will automatically launch. Desktop and Start Menu shortcuts will be generated for quick access.

---
### 1. Local Web Application
Run ASynX on your local system with hot-reload development tools:

```bash
# Clone the repository
git clone ahttps://github.com/JhayceFrancis/ASynX.git
cd ASynX

# Install dependencies
npm install

# Start development server (React + Express)
npm run dev
```
Open `http://localhost:3000` in your browser.

---

### 2. Standalone Windows Desktop Installer (.exe)
Package ASynX into a native Windows executable (`.exe`) installer using Electron and NSIS:

```bash
# Clone and enter directory
git clone https://github.com/JhayceFrancis/ASynX.git
cd ASynX

# Install dependencies
npm install

# Build frontend, server bundle, and package NSIS installer
npm run build:exe
```
The generated setup file will be created in the `release/` directory (e.g., `release/ASynX Setup 2.4.0-beta.1.exe`).

---

### 3. Self-Hosted Docker Backend & Sync Daemon
Deploy ASynX in a Docker container to act as a headless background sync server:

```bash
# Clone repository on your server
git clone https://github.com/JhayceFrancis/ASynX.git
cd ASynX

# Boot container in detached mode
docker-compose up -d
```

#### Environment Configuration (`.env` or `docker-compose.yml`):
```yaml
environment:
  - PORT=3000
  - HOST=0.0.0.0
  - REMOTE_SYNC_API_KEY=your_secure_random_key_here
  - GEMINI_API_KEY=your_optional_gemini_key
  # Optional initial credentials
  - ANILIST_ACCESS_TOKEN=
  - SIMKL_CLIENT_ID=
  - MAL_CLIENT_ID=
```

---

## 🔐 Environment Variables (`.env.example`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Web server listening port | `3000` |
| `HOST` | Bind address for Express server | `0.0.0.0` |
| `APP_URL` | Base URL used for generating webhooks | `http://localhost:3000` |
| `DATA_DIR` | Custom directory for encrypted DB file | Project root / userData |
| `REMOTE_SYNC_API_KEY` | API Key required for remote sync server endpoints | Auto-generated |
| `GEMINI_API_KEY` | Optional key for AI-assisted conflict resolution | None |
| `SSL_KEY_PATH` / `SSL_CERT_PATH` | Path to TLS private key / certificate for HTTPS | None |

---
## 💻 Download & Installation Guide (Windows Client)

Follow these steps to download and install the latest version of ASynX for Windows:

### 1. Download the Installer
1. Navigate to the [ASynX Releases page](https://github.com/JhayceFrancis/ASynX/releases) on GitHub.
2. Locate the most recent release, which will be marked with a green **Latest** badge.
3. Scroll to the bottom of the release notes and click to expand the **Assets** dropdown menu.
4. Click on the Windows executable file (e.g., `ASynX Setup 2.4.0-beta.8.exe`) to download the installer directly to your machine.

### 2. Run the Setup
1. Open your Windows **Downloads** folder (or wherever your browser saves downloaded files).
2. Double-click the downloaded `.exe` file to launch the setup process.

### 3. Bypass Windows SmartScreen (If Prompted)
Because ASynX does not currently utilise a paid enterprise code-signing certificate, Windows Defender SmartScreen may temporarily flag the programme as unrecognised upon launching the installer. To proceed securely:
1. Click on the **More info** text link within the blue SmartScreen popup window.
2. A new button will appear at the bottom right. Click **Run anyway** to authorise the installation.

### 4. Launch the Application
1. The installer will automatically unpack the files, configure the required dependencies, and complete the installation without requiring any further input.
2. Once finished, ASynX will automatically launch. Desktop and Start Menu shortcuts will be generated for quick access.

---

## 📜 Available Scripts

- `npm run dev` - Start local development server with Vite middleware.
- `npm run build` - Compile React frontend and bundle Express server into `dist/`.
- `npm start` - Launch bundled production Node server (`dist/server.cjs`).
- `npm run build:exe` - Generate standalone Windows `.exe` installer.
- `npm run lint` - Perform TypeScript type validation.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.
