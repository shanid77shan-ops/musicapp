/**
 * useSpotifySearch — the single hook App.js needs for Spotify-powered search.
 *
 * What it manages:
 *   • Debouncing the raw query (400 ms) so we don't hammer the API
 *   • Calling searchTracks() and storing the results
 *   • Loading / error state for the UI
 *   • Race-condition safety (stale responses from slow requests are discarded)
 *   • Fallback: when query is empty, shows the built-in static song list
 *
 * Returns:  { songs, isLoading, error }
 */

import { useState, useEffect } from 'react';
import { searchTracks } from '../services/spotifyApi';
import { useDebounce }   from './useDebounce';
import defaultSongs      from '../data/songs';   // static fallback while idle

/**
 * @param {string} query - Raw search text from the SearchBar
 */
export function useSpotifySearch(query) {
  const [songs,     setSongs]     = useState(defaultSongs);  // start with static list
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);           // string or null

  // Wait 400 ms after the user stops typing before firing the API call
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    // ── Empty query: restore the default static list ──────────────────────────
    if (!debouncedQuery.trim()) {
      setSongs(defaultSongs);
      setError(null);
      setIsLoading(false);
      return;
    }

    // ── Race-condition guard ──────────────────────────────────────────────────
    // If a new search starts before the previous one finishes, the old
    // request's response might arrive AFTER the new one.  The `cancelled` flag
    // makes sure we ignore results from any request that's no longer current.
    let cancelled = false;

    async function runSearch() {
      setIsLoading(true);
      setError(null);

      try {
        const results = await searchTracks(debouncedQuery);

        if (!cancelled) {
          setSongs(results);
          // If Spotify found nothing, results is [].  SongList shows "no results".
        }
      } catch (err) {
        if (!cancelled) {
          // Surface the error message to the UI
          setError(err.message ?? 'An unexpected error occurred');
          setSongs([]);   // clear stale results
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    runSearch();

    // Cleanup: mark this effect run as cancelled when the query changes again
    return () => { cancelled = true; };

  }, [debouncedQuery]);   // only re-run when the debounced value changes

  return { songs, isLoading, error };
}
