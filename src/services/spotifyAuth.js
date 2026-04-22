/**
 * spotifyAuth.js — Spotify access token manager
 *
 * Handles fetching and caching the Client Credentials access token.
 * The actual credential exchange happens in server.js (proxy); we just
 * store what comes back so we don't hammer the token endpoint.
 *
 * Token lifetime: Spotify issues tokens valid for 3600 seconds (1 hour).
 * We invalidate the cache 60 seconds early to avoid using a token that's
 * about to expire mid-request.
 */

// In-memory cache — cleared on page refresh (that's fine for a SPA)
let tokenCache = {
  accessToken: null,
  expiresAt:   null,  // absolute timestamp in milliseconds
};

/**
 * Returns a valid Spotify Bearer token, fetching a fresh one if needed.
 * Throws an Error if the proxy server is unreachable or credentials are wrong.
 */
export async function getAccessToken() {
  const now = Date.now();

  // Reuse cached token if it has more than 60 seconds of life left
  if (tokenCache.accessToken && tokenCache.expiresAt && now < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  // Ask our Express proxy for a fresh token.
  // The proxy injects the client secret — the browser never sees it.
  const response = await fetch('/api/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Token request failed (HTTP ${response.status})`);
  }

  // Spotify returns: { access_token, token_type, expires_in (seconds) }
  const { access_token, expires_in } = await response.json();

  // Store with absolute expiry so cache checks are simple
  tokenCache = {
    accessToken: access_token,
    expiresAt:   now + expires_in * 1000,
  };

  return tokenCache.accessToken;
}

/** Manually invalidate the cache (e.g. after a 401 response) */
export function clearTokenCache() {
  tokenCache = { accessToken: null, expiresAt: null };
}
