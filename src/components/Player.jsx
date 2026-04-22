import React, { useState } from "react";
import { formatDuration } from "../data/songs";

/**
 * Player — bottom control bar driven by the Spotify Web Playback SDK.
 *
 * Props:
 *   currentSong  — song object selected in the list (for disabled state)
 *   playerState  — raw Spotify SDK state (position ms, duration ms, paused)
 *   isReady      — SDK device connected and ready
 *   onPause / onResume / onSeek(ms) / onVolume(0-1) / onNext / onPrev
 */
function Player({ currentSong, playerState, isReady, onPause, onResume, onSeek, onVolume, onNext, onPrev, onAddToPlaylist }) {
  const [volume, setVolume] = useState(0.8);

  // ── Derive display values from SDK state ───────────────────────────────────
  // SDK gives position/duration in milliseconds; formatDuration expects seconds
  const isPlaying   = playerState ? !playerState.paused : false;
  const currentSec  = playerState ? Math.floor(playerState.position  / 1000) : 0;
  const durationSec = playerState ? Math.floor(playerState.duration  / 1000) : 0;
  const progressPct = durationSec ? (currentSec / durationSec) * 100 : 0;
  const volumePct   = volume * 100;

  const disabled = !currentSong || !isReady;

  // ── Controls ───────────────────────────────────────────────────────────────
  function togglePlay() {
    if (!currentSong || !isReady) return;
    isPlaying ? onPause() : onResume();
  }

  function handleSeek(e) {
    // Range input is in seconds; SDK seek() takes milliseconds
    onSeek(Number(e.target.value) * 1000);
  }

  function handleVolume(e) {
    const v = Number(e.target.value);
    setVolume(v);
    onVolume(v);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur
                    border-t border-white/10 px-4 py-3 z-50">

      {/* ── Progress bar ── */}
      <div className="flex items-center gap-2 mb-2 max-w-3xl mx-auto">
        <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
          {formatDuration(currentSec)}
        </span>

        <div className="relative flex-1 h-1.5 group">
          <input
            type="range"
            min={0}
            max={durationSec || 0}
            step={1}
            value={currentSec}
            onChange={handleSeek}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10
                       disabled:cursor-default"
          />
          <div className="h-full w-full rounded-full bg-white/20" />
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-purple-500 transition-none"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <span className="text-xs text-gray-400 w-10 tabular-nums">
          {formatDuration(durationSec)}
        </span>
      </div>

      {/* ── Controls row ── */}
      <div className="flex items-center justify-between max-w-3xl mx-auto">

        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={disabled}
          className="text-gray-400 hover:text-white disabled:opacity-30 transition p-2"
          title="Previous"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          disabled={disabled}
          className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500
                     disabled:opacity-30 flex items-center justify-center
                     transition shadow-lg"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={disabled}
          className="text-gray-400 hover:text-white disabled:opacity-30 transition p-2"
          title="Next"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" />
          </svg>
        </button>

        {/* Add to playlist */}
        {currentSong && onAddToPlaylist && (
          <button
            onClick={() => onAddToPlaylist(currentSong)}
            title="Add to playlist"
            className="text-gray-400 hover:text-purple-400 transition p-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        )}

        {/* Volume — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 w-32">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <div className="relative flex-1 h-1.5">
            <input
              type="range" min={0} max={1} step={0.01}
              value={volume}
              onChange={handleVolume}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="h-full w-full rounded-full bg-white/20" />
            <div className="absolute top-0 left-0 h-full rounded-full bg-gray-400"
                 style={{ width: `${volumePct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
