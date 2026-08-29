const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const csrfPatch = `
// ==========================================
// CSRF Fetch Interceptor
// ==========================================
const originalFetch = window.fetch;
let csrfToken = null;

// Pre-fetch the CSRF token on boot
originalFetch('/api/csrf-token')
  .then(res => res.json())
  .then(data => { if (data.csrfToken) csrfToken = data.csrfToken; })
  .catch(console.error);

window.fetch = async (...args) => {
  const [resource, config] = args;
  let method = 'GET';
  if (config && config.method) {
    method = config.method.toUpperCase();
  }
  
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!csrfToken) {
       try {
         const res = await originalFetch('/api/csrf-token');
         const data = await res.json();
         if (data.csrfToken) csrfToken = data.csrfToken;
       } catch (e) {}
    }
    if (csrfToken) {
       const headers = new Headers(config?.headers || {});
       headers.set('x-csrf-token', csrfToken);
       if (config) {
         config.headers = headers;
       } else {
         args[1] = { headers };
       }
    }
  }
  return originalFetch(...args);
};
`;

if (!code.includes("CSRF Fetch Interceptor")) {
  code = code.replace(
    "// Global error handlers to capture and send client-side errors to the backend",
    csrfPatch + "\n// Global error handlers to capture and send client-side errors to the backend"
  );
}

fs.writeFileSync('src/main.tsx', code);
console.log("Patched src/main.tsx with CSRF interceptor");
