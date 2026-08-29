
let csrfToken: string | null = null;
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!csrfToken) {
       try {
         const res = await window.fetch('/api/csrf-token');
         const data = await res.json();
         if (data.csrfToken) csrfToken = data.csrfToken;
       } catch (e) {}
    }
    if (csrfToken) {
       init = init || {};
       const headers = new Headers(init.headers || {});
       headers.set('x-csrf-token', csrfToken);
       init.headers = headers;
    }
  }
  return window.fetch(input, init);
}
