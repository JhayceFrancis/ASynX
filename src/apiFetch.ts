// Detect if running inside a Chromium or Firefox extension environment
const IS_EXTENSION =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'chrome-extension:' ||
    window.location.protocol === 'moz-extension:' ||
    (typeof chrome !== 'undefined' && Boolean(chrome?.runtime?.id)));

export const API_BASE_URL = IS_EXTENSION ? 'http://localhost:14000' : '';

let csrfToken: string | null = null;

function resolveUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!API_BASE_URL) return input;

  if (typeof input === 'string') {
    return input.startsWith('/') ? `${API_BASE_URL}${input}` : input;
  }
  return input;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const targetUrl = resolveUrl(input);
  const method = (init?.method || 'GET').toUpperCase();

  // Cross-origin requests between extension and localhost require credentials to transmit session cookies
  const options: RequestInit = {
    ...init,
    credentials: init?.credentials || 'include',
  };

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!csrfToken) {
      try {
        const res = await window.fetch(resolveUrl('/api/csrf-token'), {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.csrfToken) csrfToken = data.csrfToken;
        }
      } catch {
        // Continue without token if endpoint is unreachable or inactive
      }
    }

    if (csrfToken) {
      const headers = new Headers(options.headers || {});
      headers.set('x-csrf-token', csrfToken);
      options.headers = headers;
    }
  }

  return window.fetch(targetUrl, options);
}
