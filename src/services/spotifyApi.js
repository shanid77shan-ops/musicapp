/**
 * spotifyApi.js — Spotify Web API wrapper
 *
 * Currently exposes:
 *   searchTracks(query, limit?)  — search by title / artist / album keyword
 *
 * Data mapping:
 *   Spotify track  →  our Song object
 *   ─────────────────────────────────────────────────
 *   track.id                →  id
 *   track.name              →  title
 *   track.artists[].name    →  artist  (joined with ", ")
 *   track.album.name        →  album
 *   track.album.images      →  thumbnail  (300 px preferred)
 *   track.preview_url       →  url  (30-second MP3 — may be null)
 *   track.duration_ms / 1000→  duration  (seconds)
 *   track.external_urls     →  spotifyUrl  (link to open in Spotify)
 */

import { getAccessToken, clearTokenCache } from './spotifyAuth';

const SPOTIFY_API = 'https://api.spotify.com/v1';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Picks the best album art from Spotify's image array.
 * Spotify returns images sorted largest→smallest.
 * We prefer ~300px (index 1) for thumbnails; fall back to whatever exists.
 */
function pickThumbnail(images = []) {
  if (!images.length) return null;
  // index 1 is usually ~300×300; index 0 is ~640×640 (heavier)
  return (images[1] || images[0])?.url ?? null;
}

/**
 * Maps a single Spotify track object to our app's Song shape.
 * Fields our app uses:  id, title, artist, album, thumbnail, url, duration
 * Extra field added:    spotifyUrl  (for "Open in Spotify" links)
 */
function mapTrack(track) {
  return {
    id:         track.id,
    title:      track.name,
    // Multiple artists are joined: "Artist 1, Artist 2"
    artist:     track.artists.map((a) => a.name).join(', '),
    album:      track.album.name,
    thumbnail:  pickThumbnail(track.album.images),
    // preview_url is a 30-second clip MP3.  Spotify sets this to null for some
    // tracks (depends on licensing / region), so the player must handle null.
    url:        track.preview_url,
    // Convert milliseconds → whole seconds to match our existing formatDuration()
    duration:   Math.floor(track.duration_ms / 1000),
    // Bonus: let users open the full track in Spotify
    spotifyUrl: track.external_urls?.spotify ?? null,
  };
}

/**
 * Low-level fetch wrapper.
 * Attaches the Bearer token, handles 401 by refreshing once, then retries.
 */
async function spotifyFetch(path, retried = false) {
  const token    = await getAccessToken();
  const response = await fetch(`${SPOTIFY_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 401 = token was valid when we got it but Spotify rejected it (rare edge case)
  if (response.status === 401 && !retried) {
    clearTokenCache();            // force a fresh token on the next call
    return spotifyFetch(path, true);  // retry once
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || `Spotify API error (HTTP ${response.status})`);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Searches Spotify for tracks matching `query`.
 *
 * @param {string} query  - Search keywords (title, artist, album, etc.)
 * @param {number} limit  - Number of results to return (1–50, default 20)
 * @returns {Promise<Song[]>}  Array of Song objects; empty array if nothing found.
 *
 * Example:
 *   const songs = await searchTracks('blinding lights');
 */
export async function searchTracks(query, limit = 20) {
  if (!query.trim()) return [];

  // URLSearchParams safely encodes special characters
  const params = new URLSearchParams({
    q:     query,
    type:  'track',
    limit: String(Math.min(Math.max(limit, 1), 50)),  // clamp to Spotify's 1–50 range
  });

  const data = await spotifyFetch(`/search?${params}`);

  // data.tracks.items is the array of track objects
  return (data.tracks?.items ?? []).map(mapTrack);
}
