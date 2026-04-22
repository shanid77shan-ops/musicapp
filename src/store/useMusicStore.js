/**
 * useMusicStore.js — global Zustand store
 *
 * Owns two concerns:
 *   1. AUTH   — accessToken, refreshToken, expiryTime (persisted to localStorage)
 *   2. SEARCH — query, songs[], isLoading, error
 *
 * Auth tokens survive page refresh via the `persist` middleware.
 * Search state is intentionally NOT persisted (always re-fetch on load).
 *
 * The `searchTracks` action is debounced (500 ms) at the store level so every
 * caller (SearchBar, useEffect, etc.) shares the same debounce timer.
 */

import { create }    from 'zustand';
import { persist }   from 'zustand/middleware';
import debounce      from 'lodash.debounce';
import axios         from 'axios';

// ─── Constants ───────────────────────────────────────────────────────────────

const SPOTIFY_API      = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// CRA exposes env vars via process.env.REACT_APP_*
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;

// ─── Data mapper ─────────────────────────────────────────────────────────────

/**
 * Converts a raw Spotify track object into the flat shape our UI expects.
 *
 * Spotify track  →  our Song object
 * ──────────────────────────────────────────────────────────────
 * track.id                  →  id
 * track.name                →  title
 * track.artists[].name      →  artist   (joined with ", ")
 * track.album.images        →  albumArt (300 px preferred)
 * track.preview_url         →  previewUrl  (30-sec MP3 or null)
 * track.album.name          →  album    (needed by SongList)
 * track.duration_ms / 1000  →  duration (needed by Player)
 * track.external_urls.spotify → spotifyUrl
 */
function mapTrack(track) {
  const images = track.album?.images ?? [];
  return {
    id:         track.id,
    title:      track.name,
    artist:     track.artists.map((a) => a.name).join(', '),
    albumArt:   (images[1] ?? images[0])?.url ?? null,   // ~300px preferred
    previewUrl: track.preview_url,                        // null for some tracks
    album:      track.album?.name ?? '',
    duration:   Math.floor((track.duration_ms ?? 0) / 1000),
    spotifyUrl: track.external_urls?.spotify ?? null,
  };
}

// ─── Debounced search (created once, shared by all callers) ──────────────────
//
// Defined outside `create()` so the 500 ms timer is never reset by React
// re-renders or store rehydration.  We use a two-argument signature so the
// function can call `set` and `get` after being created.

let _set, _get;   // bound when the store initialises (see inside create() below)

const _debouncedSearch = debounce(async (query) => {
  // Require at least 2 characters — Spotify rejects single-char queries
  if (query.trim().length < 2) {
    _set({ songs: [], isLoading: false, error: null });
    return;
  }

  _set({ isLoading: true, error: null });

  try {
    // Always use a valid (possibly refreshed) token
    const token = await _get().getValidToken();

    const { data } = await axios.get(`${SPOTIFY_API}/search`, {
      params:  { q: query, type: 'track' },
      headers: { Authorization: `Bearer ${token}` },
    });

    _set({
      songs:     (data.tracks?.items ?? []).map(mapTrack),
      isLoading: false,
    });

  } catch (err) {
    console.error('[Spotify search] status:', err.response?.status);
    console.error('[Spotify search] body:',   err.response?.data);
    // Surface a readable message to the UI
    const message =
      err.response?.data?.error?.message ??
      err.message ??
      'An unexpected error occurred';

    _set({ error: message, songs: [], isLoading: false });
  }
}, 500);   // ← 500 ms debounce as requested

// ─── Store ────────────────────────────────────────────────────────────────────

const useMusicStore = create(
  persist(
    (set, get) => {
      // Expose set/get to the module-level debounced function
      _set = set;
      _get = get;

      return {
        // ── Auth state ─────────────────────────────────────────────────────────
        accessToken:  null,   // Spotify Bearer token
        refreshToken: null,   // Used to get a new accessToken without re-login
        expiryTime:   null,   // Absolute timestamp: Date.now() + expires_in * 1000

        // ── Search state (NOT persisted — see partialize below) ───────────────
        songs:     [],
        isLoading: false,
        error:     null,
        query:     '',

        // ── Auth actions ───────────────────────────────────────────────────────

        /** Store all three token fields at once */
        setTokens: ({ accessToken, refreshToken, expiryTime }) =>
          set({ accessToken, refreshToken, expiryTime }),

        /** Wipe tokens on logout */
        clearTokens: () =>
          set({ accessToken: null, refreshToken: null, expiryTime: null }),

        /**
         * Returns true when the current access token is missing or within
         * 60 seconds of expiry.  The 60-second buffer prevents using a token
         * that expires mid-request.
         */
        isTokenExpired: () => {
          const { expiryTime } = get();
          return !expiryTime || Date.now() >= expiryTime - 60_000;
        },

        /**
         * Exchanges the stored refreshToken for a new accessToken.
         * Spotify may also rotate the refreshToken; we always save the latest one.
         * Throws if no refreshToken is available (user must log in again).
         */
        refreshAccessToken: async () => {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error('Session expired — please log in again');
          }

          // PKCE refresh: only needs client_id (no client_secret in the browser)
          const { data } = await axios.post(
            SPOTIFY_TOKEN_URL,
            new URLSearchParams({
              grant_type:    'refresh_token',
              refresh_token: refreshToken,
              client_id:     CLIENT_ID,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
          );

          const newExpiry = Date.now() + data.expires_in * 1000;

          get().setTokens({
            accessToken:  data.access_token,
            // Spotify may issue a new refresh token; fall back to the old one
            refreshToken: data.refresh_token ?? refreshToken,
            expiryTime:   newExpiry,
          });

          return data.access_token;
        },

        /**
         * Returns a guaranteed-valid access token.
         * Refreshes automatically when expired; throws if refresh fails.
         */
        getValidToken: async () => {
          const { accessToken, isTokenExpired, refreshAccessToken } = get();
          if (!accessToken || isTokenExpired()) {
            return refreshAccessToken();   // awaits internally
          }
          return accessToken;
        },

        // ── Search actions ─────────────────────────────────────────────────────

        /**
         * Update the search query and trigger a debounced Spotify API call.
         * Call this from SearchBar's onChange handler.
         */
        setQuery: (query) => {
          set({ query });
          _debouncedSearch(query);
        },

        /**
         * Directly invoke the debounced search (skips the query state update).
         * Useful if you want to trigger a search without changing the visible input.
         */
        searchTracks: (query) => _debouncedSearch(query),
      };
    },

    {
      name: 'musicapp-auth',   // localStorage key

      // Only persist auth tokens — search state should always start fresh
      partialize: (state) => ({
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        expiryTime:   state.expiryTime,
      }),
    },
  ),
);

export default useMusicStore;
