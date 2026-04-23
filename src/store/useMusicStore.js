/**
 * useMusicStore.js — global Zustand store
 *
 * Concerns:
 *   1. AUTH      — accessToken, refreshToken, expiryTime (persisted to localStorage)
 *   2. SEARCH    — query, songs[], isLoading, error
 *   3. HISTORY   — recent search queries (persisted to localStorage)
 *   4. PLAYLISTS — stored in Supabase; in-memory list kept for UI rendering
 */

import { create }   from 'zustand';
import { persist }  from 'zustand/middleware';
import debounce     from 'lodash.debounce';
import axios        from 'axios';
import * as svc     from '../services/playlistService';

const SPOTIFY_API       = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID         = process.env.REACT_APP_SPOTIFY_CLIENT_ID;

// ─── Track mapper ─────────────────────────────────────────────────────────────
function mapTrack(track) {
  const images = track.album?.images ?? [];
  return {
    id:         track.id,
    title:      track.name,
    artist:     track.artists.map((a) => a.name).join(', '),
    albumArt:   (images[1] ?? images[0])?.url ?? null,
    previewUrl: track.preview_url,
    album:      track.album?.name ?? '',
    duration:   Math.floor((track.duration_ms ?? 0) / 1000),
    spotifyUrl: track.external_urls?.spotify ?? null,
  };
}

// ─── Module-level refs bound inside create() ──────────────────────────────────
let _set, _get;

const _debouncedSearch = debounce(async (query) => {
  if (query.trim().length < 2) {
    _set({ songs: [], isLoading: false, error: null });
    return;
  }
  _set({ isLoading: true, error: null });
  try {
    const token = await _get().getValidToken();
    const { data } = await axios.get(`${SPOTIFY_API}/search`, {
      params:  { q: query, type: 'track,artist,album', limit: 50 },
      headers: { Authorization: `Bearer ${token}` },
    });
    const songs   = (data.tracks?.items  ?? []).map(mapTrack);
    const artists = (data.artists?.items ?? []).map((a) => ({
      id:         a.id,
      name:       a.name,
      image:      a.images?.[0]?.url ?? null,
      genres:     a.genres?.slice(0, 2) ?? [],
      followers:  a.followers?.total ?? 0,
      spotifyUrl: a.external_urls?.spotify ?? null,
    }));
    const albums = (data.albums?.items ?? []).map((al) => ({
      id:         al.id,
      name:       al.name,
      artist:     al.artists.map((a) => a.name).join(', '),
      image:      al.images?.[1]?.url ?? al.images?.[0]?.url ?? null,
      year:       al.release_date?.slice(0, 4) ?? '',
      spotifyUrl: al.external_urls?.spotify ?? null,
    }));
    _set({ songs, artists, albums, isLoading: false });
    if (songs.length > 0) _get().addToHistory(query);
  } catch (err) {
    const message = err.response?.data?.error?.message ?? err.message ?? 'Search failed';
    _set({ error: message, songs: [], artists: [], albums: [], isLoading: false });
  }
}, 500);

// ─── Store ────────────────────────────────────────────────────────────────────
const useMusicStore = create(
  persist(
    (set, get) => {
      _set = set;
      _get = get;

      return {
        // ── Auth ───────────────────────────────────────────────────────────────
        accessToken:   null,
        refreshToken:  null,
        expiryTime:    null,
        spotifyUserId: null,   // fetched from /v1/me after login

        setTokens: ({ accessToken, refreshToken, expiryTime }) =>
          set({ accessToken, refreshToken, expiryTime }),

        clearTokens: () =>
          set({
            accessToken: null, refreshToken: null, expiryTime: null,
            spotifyUserId: null, playlists: [],
          }),

        isTokenExpired: () => {
          const { expiryTime } = get();
          return !expiryTime || Date.now() >= expiryTime - 60_000;
        },

        refreshAccessToken: async () => {
          const { refreshToken } = get();
          if (!refreshToken) throw new Error('Session expired — please log in again');
          const { data } = await axios.post(
            SPOTIFY_TOKEN_URL,
            new URLSearchParams({
              grant_type:    'refresh_token',
              refresh_token: refreshToken,
              client_id:     CLIENT_ID,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
          );
          get().setTokens({
            accessToken:  data.access_token,
            refreshToken: data.refresh_token ?? refreshToken,
            expiryTime:   Date.now() + data.expires_in * 1000,
          });
          return data.access_token;
        },

        getValidToken: async () => {
          const { accessToken, isTokenExpired, refreshAccessToken } = get();
          if (!accessToken || isTokenExpired()) return refreshAccessToken();
          return accessToken;
        },

        // ── User profile (Spotify ID) ──────────────────────────────────────────
        fetchUserProfile: async () => {
          try {
            const token = await get().getValidToken();
            const { data } = await axios.get(`${SPOTIFY_API}/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            set({ spotifyUserId: data.id });
            await get().loadPlaylists(data.id);
          } catch (err) {
            console.error('[useMusicStore] fetchUserProfile failed:', err.message);
          }
        },

        // ── Search ─────────────────────────────────────────────────────────────
        songs:     [],
        artists:   [],
        albums:    [],
        isLoading: false,
        error:     null,
        query:     '',

        setQuery: (query) => { set({ query }); _debouncedSearch(query); },
        searchTracks: (query) => _debouncedSearch(query),

        // ── Search history (persisted to localStorage) ─────────────────────────
        searchHistory: [],

        addToHistory: (query) => {
          const q = query.trim();
          if (q.length < 2) return;
          set((s) => ({
            searchHistory: [q, ...s.searchHistory.filter((h) => h !== q)].slice(0, 10),
          }));
        },

        clearHistory: () => set({ searchHistory: [] }),

        removeFromHistory: (query) =>
          set((s) => ({ searchHistory: s.searchHistory.filter((h) => h !== query) })),

        // ── Pinned playlists ───────────────────────────────────────────────────
        pinnedPlaylistIds: [],

        togglePinPlaylist: (playlistId) =>
          set((s) => ({
            pinnedPlaylistIds: s.pinnedPlaylistIds.includes(playlistId)
              ? s.pinnedPlaylistIds.filter((id) => id !== playlistId)
              : [...s.pinnedPlaylistIds, playlistId],
          })),

        // ── Playlists (Supabase) ───────────────────────────────────────────────
        playlists:        [],
        playlistsLoading: false,

        /** Load all playlists from Supabase for the given userId */
        loadPlaylists: async (userId) => {
          const uid = userId ?? get().spotifyUserId;
          if (!uid) return;
          set({ playlistsLoading: true });
          try {
            const playlists = await svc.fetchPlaylists(uid);
            set({ playlists, playlistsLoading: false });
          } catch (err) {
            console.error('[useMusicStore] loadPlaylists failed:', err.message);
            set({ playlistsLoading: false });
          }
        },

        createPlaylist: async (name) => {
          const uid = get().spotifyUserId;
          const id  = Date.now().toString();
          // Optimistic update
          set((s) => ({ playlists: [{ id, name, songs: [] }, ...s.playlists] }));
          try {
            await svc.createPlaylist(uid, id, name);
          } catch (err) {
            console.error('[useMusicStore] createPlaylist failed:', err.message);
            // Roll back
            set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
          }
          return id;
        },

        addSongToPlaylist: async (playlistId, song) => {
          const uid = get().spotifyUserId;
          const playlist = get().playlists.find((p) => p.id === playlistId);
          const position = playlist ? playlist.songs.length : 0;
          // Optimistic update
          set((s) => ({
            playlists: s.playlists.map((p) =>
              p.id === playlistId && !p.songs.find((s2) => s2.id === song.id)
                ? { ...p, songs: [...p.songs, song] }
                : p,
            ),
          }));
          try {
            await svc.addSongToPlaylist(playlistId, uid, song, position);
          } catch (err) {
            console.error('[useMusicStore] addSongToPlaylist failed:', err.message);
            // Roll back
            set((s) => ({
              playlists: s.playlists.map((p) =>
                p.id === playlistId
                  ? { ...p, songs: p.songs.filter((s2) => s2.id !== song.id) }
                  : p,
              ),
            }));
          }
        },

        removeSongFromPlaylist: async (playlistId, songId) => {
          const prev = get().playlists;
          // Optimistic update
          set((s) => ({
            playlists: s.playlists.map((p) =>
              p.id === playlistId
                ? { ...p, songs: p.songs.filter((s2) => s2.id !== songId) }
                : p,
            ),
          }));
          try {
            await svc.removeSongFromPlaylist(playlistId, songId);
          } catch (err) {
            console.error('[useMusicStore] removeSongFromPlaylist failed:', err.message);
            set({ playlists: prev });
          }
        },

        deletePlaylist: async (playlistId) => {
          const prev = get().playlists;
          set((s) => ({ playlists: s.playlists.filter((p) => p.id !== playlistId) }));
          try {
            await svc.deletePlaylist(playlistId);
          } catch (err) {
            console.error('[useMusicStore] deletePlaylist failed:', err.message);
            set({ playlists: prev });
          }
        },

        renamePlaylist: async (playlistId, name) => {
          set((s) => ({
            playlists: s.playlists.map((p) =>
              p.id === playlistId ? { ...p, name } : p,
            ),
          }));
          try {
            await svc.renamePlaylist(playlistId, name);
          } catch (err) {
            console.error('[useMusicStore] renamePlaylist failed:', err.message);
          }
        },
      };
    },

    {
      name: 'musicapp-auth',
      // Only persist auth tokens + search history; playlists live in Supabase
      partialize: (state) => ({
        accessToken:       state.accessToken,
        refreshToken:      state.refreshToken,
        expiryTime:        state.expiryTime,
        spotifyUserId:     state.spotifyUserId,
        searchHistory:     state.searchHistory,
        pinnedPlaylistIds: state.pinnedPlaylistIds,
      }),
    },
  ),
);

export default useMusicStore;
