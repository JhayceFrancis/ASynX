/**
 * ASynX Extension Background Service Worker (public/background.js)
 * Bridges cross-origin and private network access requests from webpage content scripts
 * to the local ASynX desktop API (http://localhost:14000).
 */

const runtimeAPI = typeof browser !== 'undefined' ? browser : chrome;

runtimeAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'ASYNX_LOCAL_API_REQUEST') {
    const { endpoint, method = 'GET', body = null } = message.payload;
    const url = `http://localhost:14000${endpoint}`;

    const fetchOptions = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
    }

    fetch(url, fetchOptions)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        sendResponse({ success: res.ok, status: res.status, data });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });

    // Required to enable asynchronous sendResponse handling in Chrome/Edge/Safari
    return true;
  }
});
