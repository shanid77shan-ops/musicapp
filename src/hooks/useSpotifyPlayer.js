/**
 * useSpotifyPlayer.js — Spotify Web Playback SDK integration
 *
 * Initialises a Spotify "device" in the browser so full tracks can be
 * streamed directly (requires Spotify Premium).
 *
 * Flow:
 *   1. SDK script (loaded in index.html) fires window.onSpotifyWebPlaybackSDKReady
 *   2. We create a Spotify.Player, connect it, and receive a device_id
 *   3. playTrack(id) tells Spotify to stream spotify:track:<id> to our device
 *   4. playerState is polled every 500 ms so the progress bar stays smooth
 *
 * Returns:
 *   isReady       — SDK connected and ready to play
 *   playerState   — raw Spotify SDK state (position, duration, paused, track…)
 *   playTrack(id) — start playing a track by Spotify track ID
 *   pause / resume / seek(ms) / setVolume(0-1)
 *   previousTrack / nextTrack
 *   error         — string if initialisation failed (e.g. non-Premium account)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import useMusicStore from '../store/useMusicStore';

const POLL_INTERVAL_MS = 500;

export function useSpotifyPlayer() {
  const [isReady,     setIsReady]     = useState(false);
  const [deviceId,    setDeviceId]    = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [error,       setError]       = useState(null);

  const playerRef  = useRef(null);
  const pollRef    = useRef(null);
  const deviceRef  = useRef(null);   // stable ref so callbacks don't go stale

  const { getValidToken } = useMusicStore();

  // ── Initialise the SDK player ─────────────────────────────────────────────
  useEffect(() => {
    function initPlayer() {
      const player = new window.Spotify.Player({
        name: 'MusicApp',
        // SDK calls this any time it needs a fresh token
        getOAuthToken: async (cb) => {
          try {
            const token = await getValidToken();
            cb(token);
          } catch {
            cb('');
          }
        },
        volume: 0.8,
      });

      // ── SDK event listeners ─────────────────────────────────────────────
      player.addListener('ready', ({ device_id }) => {
        deviceRef.current = device_id;
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
      });

      player.addListener('not_ready', () => {
        setIsReady(false);
      });

      // Fires on play/pause/seek/track-change; supplement with polling
      player.addListener('player_state_changed', (state) => {
        setPlayerState(state);
      });

      // Fired when the token lacks required scopes (e.g. "streaming")
      player.addListener('authentication_error', () => {
        setError('REAUTH_REQUIRED');
      });

      player.addListener('account_error', ({ message }) => {
        setError(message.includes('Premium')
          ? 'Spotify Premium is required for full-track playback.'
          : `Account error: ${message}`);
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('[SpotifyPlayer] Playback error:', message);
      });

      player.connect();
      playerRef.current = player;
    }

    // SDK may already be loaded (e.g. hot-reload) or fire later
    if (window.Spotify?.Player) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      clearInterval(pollRef.current);
      playerRef.current?.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll current state every 500 ms for smooth progress bar ──────────────
  useEffect(() => {
    if (!isReady) return;

    pollRef.current = setInterval(async () => {
      const state = await playerRef.current?.getCurrentState();
      if (state) setPlayerState(state);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [isReady]);

  // ── Playback controls ─────────────────────────────────────────────────────

  /**
   * Stream a full track to this browser device.
   * Calls PUT /v1/me/player/play with the Spotify track URI.
   */
  const playTrack = useCallback(async (trackId) => {
    const id = deviceRef.current;
    if (!id) { setError('Player not ready yet — please wait a moment.'); return; }

    try {
      const token = await getValidToken();
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${id}`,
        {
          method:  'PUT',
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
        },
      );

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        const msg  = body?.error?.message ?? `Playback failed (${res.status})`;
        // 403 means the account is not Premium
        if (res.status === 403) {
          setError('Spotify Premium is required for full-track playback.');
        } else {
          setError(msg);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }, [getValidToken]);

  const pause         = useCallback(() => playerRef.current?.pause(),         []);
  const resume        = useCallback(() => playerRef.current?.resume(),        []);
  const seek          = useCallback((ms) => playerRef.current?.seek(ms),      []);
  const setVolume     = useCallback((v)  => playerRef.current?.setVolume(v),  []);
  const previousTrack = useCallback(() => playerRef.current?.previousTrack(), []);
  const nextTrack     = useCallback(() => playerRef.current?.nextTrack(),     []);

  return {
    isReady,
    deviceId,
    playerState,
    error,
    playTrack,
    pause,
    resume,
    seek,
    setVolume,
    previousTrack,
    nextTrack,
  };
}
