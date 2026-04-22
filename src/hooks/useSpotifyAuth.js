/**
 * useSpotifyAuth.js — Spotify OAuth 2.0 Authorization Code + PKCE flow
 *
 * Why PKCE instead of plain Authorization Code?
 *   A React SPA cannot safely store a client secret (the bundle is public).
 *   PKCE replaces the secret with a one-time crypto challenge so the flow is
 *   secure without any server-side component.
 *
 * Full flow:
 *   login()            → generates PKCE pair, saves verifier, redirects to Spotify
 *   [user logs in]     → Spotify redirects to /callback?code=...
 *   handleCallback()   → exchanges code + verifier for tokens, saves to store
 *   [token expires]    → getValidToken() in store auto-refreshes via refreshAccessToken()
 *
 * Scopes requested (extend if you add Spotify features later):
 *   user-read-private   — read user profile (needed by some Spotify endpoints)
 *   user-read-email     — read email (best practice with user-read-private)
 */

import { useEffect, useCallback } from 'react';
import axios                      from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
import useMusicStore              from '../store/useMusicStore';

// ─── Constants ───────────────────────────────────────────────────────────────

const CLIENT_ID    = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI
                      ?? 'http://127.0.0.1:3000/callback';
// streaming + playback scopes are required for the Web Playback SDK
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

// sessionStorage key for the PKCE verifier (must survive the redirect)
const VERIFIER_KEY = 'spotify_pkce_verifier';

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns:
 *   login()          — start the Spotify auth flow
 *   logout()         — clear tokens and return to the login screen
 *   isAuthenticated  — true when a valid access token is stored
 */
export function useSpotifyAuth() {
  const { accessToken, setTokens, clearTokens } = useMusicStore();

  // ── Handle the /callback redirect on mount ─────────────────────────────────
  useEffect(() => {
    const url        = new URL(window.location.href);
    const isCallback = url.pathname === '/callback';
    const hasCode    = url.searchParams.has('code');

    // Only attempt exchange if we're on /callback with a code AND
    // a verifier exists — prevents double-exchange on page refresh
    if (isCallback && hasCode && sessionStorage.getItem('spotify_pkce_verifier')) {
      _handleCallback(url, setTokens).catch((err) => {
        console.error('[useSpotifyAuth] Callback failed:', err.message);
        window.history.replaceState({}, '', '/');
      });
    } else if (isCallback) {
      // No verifier means stale callback URL — just go home
      window.history.replaceState({}, '', '/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start the OAuth flow ───────────────────────────────────────────────────
  const login = useCallback(async () => {
    if (!CLIENT_ID) {
      console.error(
        '[useSpotifyAuth] REACT_APP_SPOTIFY_CLIENT_ID is not set. ' +
        'Add it to your .env file and restart the dev server.',
      );
      return;
    }

    // 1. Generate a fresh PKCE pair for this login attempt
    const verifier   = generateCodeVerifier();
    const challenge  = await generateCodeChallenge(verifier);

    // 2. Save the verifier in sessionStorage — it must survive the redirect
    sessionStorage.setItem(VERIFIER_KEY, verifier);

    // 3. Build the Spotify authorization URL
    const params = new URLSearchParams({
      client_id:             CLIENT_ID,
      response_type:         'code',
      redirect_uri:          REDIRECT_URI,
      scope:                 SCOPES,
      code_challenge_method: 'S256',
      code_challenge:        challenge,
    });

    // 4. Full-page redirect to Spotify login
    const authUrl = `https://accounts.spotify.com/authorize?${params}`;
    console.log('[Auth] Redirect URI being sent:', REDIRECT_URI);
    console.log('[Auth] Full auth URL:', authUrl);
    window.location.href = authUrl;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearTokens();
    sessionStorage.removeItem(VERIFIER_KEY);
  }, [clearTokens]);

  return {
    login,
    logout,
    isAuthenticated: !!accessToken,
  };
}

// ─── Internal: handle the /callback URL ──────────────────────────────────────
//
// Extracted from the hook so it can be async and still be called inside useEffect.

async function _handleCallback(url, setTokens) {
  const code  = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  // User denied access on Spotify's login screen
  if (error) {
    console.warn('[useSpotifyAuth] Spotify denied access:', error);
    window.history.replaceState({}, '', '/');
    return;
  }

  if (!code) {
    window.history.replaceState({}, '', '/');
    return;
  }

  // Retrieve the verifier we stored before the redirect
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) {
    // Can happen if the user opens the callback URL directly or sessionStorage
    // was cleared.  Nothing to do — send them back home.
    window.history.replaceState({}, '', '/');
    return;
  }

  // Exchange authorization code + verifier for tokens
  // Spotify allows this from the browser for PKCE (no client_secret needed)
  const { data } = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  REDIRECT_URI,
      client_id:     CLIENT_ID,
      code_verifier: verifier,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  // Save tokens to the Zustand store (also persists to localStorage)
  setTokens({
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiryTime:   Date.now() + data.expires_in * 1000,
  });

  // Clean up — verifier is single-use
  sessionStorage.removeItem(VERIFIER_KEY);

  // Remove the code from the URL so a page refresh doesn't re-attempt the exchange
  window.history.replaceState({}, '', '/');
}
