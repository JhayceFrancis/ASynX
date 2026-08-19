const fs = require('fs');

let readme = fs.readFileSync('README.md', 'utf8');

const newFeatures = `
### 🛠️ Advanced Customization & Real-Time Telemetry
- **Dynamic Theme Engine**: Personalize your experience with full color palette controls. Customize primary/accent colors, button states, header backgrounds, layout padding scalars, and complex multi-color radial or linear gradients.
- **System Health Dashboard**: Monitor real-time status, API ping latency, and memory usage for external integrations (Simkl, MAL, AniList) and internal services (Plex, Tautulli, Jellyfin, Emby).
- **Expanded Media Taxonomy**: Full categorization support including *Anime TV Series*, *Anime Film*, *Anime Special*, *Drama*, *TV Series*, and *Film* with automated fallback logic for legacy CSV/HTML imports.
- **Bulk Action Modals**: Intuitive mass-synchronization controls (e.g. 'Sync All Selected' vs 'Only Resolve Conflicts').
- **WebSocket Reactivity**: UI instantly reacts and updates progress charts when a remote Plex/Tautulli webhook scrobbles an episode, backed by a deduplication playback session manager.

`;

readme = readme.replace('### 🔄 Multi-Platform Sync & Automation', newFeatures + '### 🔄 Multi-Platform Sync & Automation');

fs.writeFileSync('README.md', readme);

