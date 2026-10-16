/**
 * Universal Browser API Namespace (Supports Chrome, Edge, and Safari WebKit)
 */
const runtimeAPI = typeof browser !== 'undefined' ? browser : chrome;

/**
 * Privileged Background Proxy for ASynX Local API (Port 14000)
 * Bypasses Safari Mixed-Content blocks and Chrome/Edge Private Network Access (PNA) restrictions
 */
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

    // Return true to keep the message channel open for the asynchronous fetch response
    return true;
  }
});
