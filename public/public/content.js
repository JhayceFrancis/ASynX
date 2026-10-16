/**
 * ASynX Universal Content Script (public/content.js)
 * Replaces the 4 standalone Simkl userscripts for MAL, AniList, AniDB, and Trakt.
 * Communicates with localhost:14000 via the Background Service Worker bridge.
 */

const runtimeAPI = typeof browser !== 'undefined' ? browser : chrome;

/**
 * Helper: Sends HTTP requests to localhost:14000 via public/background.js
 * Bypasses HTTPS Mixed-Content and Private Network Access blocks in Chrome, Edge, and Safari.
 */
function requestLocalAsynxApi(endpoint, method = 'GET', body = null) {
  return new Promise((resolve) => {
    try {
      runtimeAPI.runtime.sendMessage(
        {
          type: 'ASYNX_LOCAL_API_REQUEST',
          payload: { endpoint, method, body }
        },
        (response) => {
          if (runtimeAPI.runtime.lastError) {
            resolve({ success: false, error: runtimeAPI.runtime.lastError.message });
          } else {
            resolve(response || { success: false, error: 'No response from background worker' });
          }
        }
      );
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
}

/**
 * Step 1: Detect which tracker website the user is currently browsing and extract the ID
 */
function detectCurrentPageMedia() {
  const { hostname, pathname } = window.location;

  // 1. MyAnimeList: https://myanimelist.net/anime/51415/...
  if (hostname.includes('myanimelist.net')) {
    const match = pathname.match(/^\/anime\/(\d+)/);
    if (match) return { platform: 'mal', id: Number(match[1]), query: `mal=${match[1]}` };
  }

  // 2. AniList: https://anilist.co/anime/146676/...
  if (hostname.includes('anilist.co')) {
    const match = pathname.match(/^\/anime\/(\d+)/);
    if (match) return { platform: 'anilist', id: Number(match[1]), query: `anilist=${match[1]}` };
  }

  // 3. AniDB: https://anidb.net/anime/15410
  if (hostname.includes('anidb.net')) {
    const match = pathname.match(/^\/anime\/(\d+)/);
    if (match) return { platform: 'anidb', id: Number(match[1]), query: `anidb=${match[1]}` };
  }

  // 4. Trakt: https://trakt.tv/shows/slug-or-id
  if (hostname.includes('trakt.tv')) {
    const match = pathname.match(/^\/(shows|movies)\/([^/]+)/);
    if (match) return { platform: 'trakt', id: match[2], query: `trakt=${encodeURIComponent(match[2])}` };
  }

  return null;
}

/**
 * Step 2: Inject the Cross-Platform Links & Quick-Sync Bar into the Webpage DOM
 */
function injectAsynxRibbon(resolvedData, currentMedia) {
  if (document.getElementById('asynx-crosslink-ribbon')) return;

  const { links = {}, ids = {} } = resolvedData;

  const ribbon = document.createElement('div');
  ribbon.id = 'asynx-crosslink-ribbon';
  ribbon.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    background: rgba(10, 10, 16, 0.92);
    border: 1px solid #00f0ff;
    border-radius: 10px;
    box-shadow: 0 0 18px rgba(0, 240, 255, 0.25);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    color: #f8fafc;
    backdrop-filter: blur(8px);
  `;

  const badge = document.createElement('span');
  badge.textContent = 'ASynX';
  badge.style.cssText = 'font-weight: 700; color: #00f0ff; letter-spacing: 0.5px; margin-right: 4px;';
  ribbon.appendChild(badge);

  // Create deep-link buttons for every other resolved platform
  const platforms = [
    { key: 'simkl', label: 'Simkl', colour: '#a855f7' },
    { key: 'anilist', label: 'AniList', colour: '#02a9ff' },
    { key: 'mal', label: 'MAL', colour: '#2e51a2' },
    { key: 'anidb', label: 'AniDB', colour: '#f59e0b' },
    { key: 'trakt', label: 'Trakt', colour: '#ed1c24' }
  ];

  platforms.forEach(({ key, label, colour }) => {
    if (links[key] && key !== currentMedia.platform) {
      const linkBtn = document.createElement('a');
      linkBtn.href = links[key];
      linkBtn.target = '_blank';
      linkBtn.rel = 'noopener noreferrer';
      linkBtn.textContent = label;
      linkBtn.style.cssText = `
        padding: 4px 10px;
        border-radius: 6px;
        background: ${colour}22;
        border: 1px solid ${colour};
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
        transition: opacity 0.2s;
      `;
      ribbon.appendChild(linkBtn);
    }
  });

  // Add a 1-Click "+1 Episode Sync" button that pushes via the Bridge
  const syncBtn = document.createElement('button');
  syncBtn.textContent = 'Sync to All';
  syncBtn.style.cssText = `
    padding: 4px 12px;
    border-radius: 6px;
    background: linear-gradient(135deg, #00f0ff, #a855f7);
    border: none;
    color: #0a0a0a;
    font-weight: 700;
    cursor: pointer;
  `;

  syncBtn.addEventListener('click', async () => {
    syncBtn.textContent = 'Syncing...';
    const syncResponse = await requestLocalAsynxApi('/api/sync/push', 'POST', {
      externalId: ids,
      statePayload: {
        title: document.title.replace(/ - (MyAnimeList\.net|AniList|AniDB|Trakt).*$/i, '').trim(),
        episode: 1,
        season: 1,
        status: 'watching'
      }
    });

    syncBtn.textContent = syncResponse.success ? 'Synced!' : 'Sync Failed';
    setTimeout(() => { syncBtn.textContent = 'Sync to All'; }, 3000);
  });

  ribbon.appendChild(syncBtn);
  document.body.appendChild(ribbon);
}

/**
 * Step 3: Initialise when the page loads
 */
async function initAsynxContentScript() {
  const currentMedia = detectCurrentPageMedia();
  if (!currentMedia) return;

  // Query localhost:14000 through the background service worker bridge
  const result = await requestLocalAsynxApi(`/api/sync/resolve?${currentMedia.query}`);

  if (result && result.success && result.data) {
    injectAsynxRibbon(result.data, currentMedia);
  } else {
    // Fallback if the local ASynX desktop app is closed: use Simkl's direct redirect URLs
    const simklRedirectBase = `https://api.simkl.com/redirect?${currentMedia.platform}=${currentMedia.id}`;
    injectAsynxRibbon({
      ids: { [currentMedia.platform]: currentMedia.id },
      links: {
        simkl: `${simklRedirectBase}&to=Simkl`,
        anilist: `${simklRedirectBase}&to=AniList`,
        mal: `${simklRedirectBase}&to=MAL`
      }
    }, currentMedia);
  }
}

initAsynxContentScript();
