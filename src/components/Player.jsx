import React, { useState } from "react";
import { formatDuration } from "../data/songs";
import { useTheme } from "../context/ThemeContext";

function Player({
  currentSong, playerState, isReady,
  onPause, onResume, onSeek, onVolume,
  onNext, onPrev, onAddToPlaylist,
  shuffle, onShuffleToggle,
  repeat,  onRepeatToggle,
}) {
  const [volume, setVolume] = useState(0.8);
  const { isDark } = useTheme();

  const isPlaying   = playerState ? !playerState.paused : false;
  const currentSec  = playerState ? Math.floor(playerState.position / 1000) : 0;
  const durationSec = playerState ? Math.floor(playerState.duration  / 1000) : 0;
  const progressPct = durationSec ? (currentSec / durationSec) * 100 : 0;
  const volumePct   = volume * 100;
  const disabled    = !currentSong || !isReady;

  function togglePlay() {
    if (!currentSong || !isReady) return;
    isPlaying ? onPause() : onResume();
  }

  function handleSeek(e)   { onSeek(Number(e.target.value) * 1000); }
  function handleVolume(e) { const v = Number(e.target.value); setVolume(v); onVolume(v); }

  // Repeat icon helpers
  const repeatIcon = repeat === 'one'
    ? (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
      </svg>
    );

  const barBg   = isDark ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-gray-200';
  const timeTxt = isDark ? 'text-gray-400' : 'text-gray-500';
  const ctrlBtn = isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900';

  return (
    <div className={`fixed bottom-0 left-0 right-0 backdrop-blur border-t px-4 py-3 z-50 ${barBg}`}>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2 max-w-3xl mx-auto">
        <span className={`text-xs w-10 text-right tabular-nums ${timeTxt}`}>
          {formatDuration(currentSec)}
        </span>
        <div className="relative flex-1 h-1.5 group">
          <input
            type="range" min={0} max={durationSec || 0} step={1} value={currentSec}
            onChange={handleSeek} disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-default"
          />
          <div className={`h-full w-full rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
          <div className="absolute top-0 left-0 h-full rounded-full bg-purple-500 transition-none"
               style={{ width: `${progressPct}%` }} />
        </div>
        <span className={`text-xs w-10 tabular-nums ${timeTxt}`}>
          {formatDuration(durationSec)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between max-w-3xl mx-auto">

        {/* Shuffle */}
        <button
          onClick={onShuffleToggle}
          title="Shuffle"
          className={`p-2 transition rounded-lg ${
            shuffle
              ? 'text-purple-400 bg-purple-500/20'
              : `${ctrlBtn} opacity-60`
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
        </button>

        {/* Previous */}
        <button onClick={onPrev} disabled={disabled}
          className={`${ctrlBtn} disabled:opacity-30 transition p-2`} title="Previous">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button onClick={togglePlay} disabled={disabled}
          className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500
                     disabled:opacity-30 flex items-center justify-center transition shadow-lg"
          title={isPlaying ? 'Pause' : 'Play'}>
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
        <button onClick={onNext} disabled={disabled}
          className={`${ctrlBtn} disabled:opacity-30 transition p-2`} title="Next">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" />
          </svg>
        </button>

        {/* Repeat */}
        <button
          onClick={onRepeatToggle}
          title={repeat === 'off' ? 'Repeat off' : repeat === 'all' ? 'Repeat all' : 'Repeat one'}
          className={`p-2 transition rounded-lg ${
            repeat !== 'off'
              ? 'text-purple-400 bg-purple-500/20'
              : `${ctrlBtn} opacity-60`
          }`}
        >
          {repeatIcon}
        </button>
      </div>

      {/* Second row: add-to-playlist + volume */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mt-2">
        {/* Add to playlist */}
        <div className="w-24">
          {currentSong && onAddToPlaylist && (
            <button
              onClick={() => onAddToPlaylist(currentSong)}
              title="Add to playlist"
              className={`${ctrlBtn} transition p-1.5 flex items-center gap-1.5 text-xs`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span className="hidden sm:inline">Add to playlist</span>
            </button>
          )}
        </div>

        {/* Song info (center) */}
        {currentSong && (
          <div className="flex-1 text-center px-2 min-w-0">
            <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentSong.title}
            </p>
            <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentSong.artist}
            </p>
          </div>
        )}

        {/* Volume */}
        <div className="w-24 hidden sm:flex items-center gap-2 justify-end">
          <svg className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
               fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <div className="relative flex-1 h-1.5">
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={handleVolume}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className={`h-full w-full rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
            <div className={`absolute top-0 left-0 h-full rounded-full ${isDark ? 'bg-gray-400' : 'bg-gray-500'}`}
                 style={{ width: `${volumePct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
