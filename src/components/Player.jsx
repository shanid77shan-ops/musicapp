import React, { useEffect, useRef, useState } from "react";
import { formatDuration } from "../data/songs";

// Player: the bottom audio control bar.
// Props:
//   currentSong — song object currently loaded (null when nothing selected)
//   playlist    — full ordered array used to compute next/previous
//   onNext      — callback to move to the next song
//   onPrev      — callback to move to the previous song
function Player({ currentSong, playlist, onNext, onPrev }) {
  // ── Audio element ref ──────────────────────────────────────────────────────
  const audioRef = useRef(null);

  // ── Local state ────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);   // seconds elapsed
  const [duration, setDuration] = useState(0);          // total seconds
  const [volume, setVolume] = useState(0.8);            // 0 – 1

  // ── Load a new song whenever currentSong changes ───────────────────────────
  useEffect(() => {
    if (!currentSong) return;

    const audio = audioRef.current;
    audio.src = currentSong.url;
    audio.volume = volume;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    setCurrentTime(0);
  }, [currentSong]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keep volume in sync ────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ── Auto-advance to next song when one finishes ────────────────────────────
  function handleEnded() {
    onNext();
  }

  // ── Sync progress bar while audio plays ────────────────────────────────────
  function handleTimeUpdate() {
    setCurrentTime(audioRef.current.currentTime);
  }

  function handleLoadedMetadata() {
    setDuration(audioRef.current.duration);
  }

  // ── Play / Pause toggle ────────────────────────────────────────────────────
  function togglePlay() {
    if (!currentSong) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }

  // ── Seek: user drags the progress bar ─────────────────────────────────────
  function handleSeek(e) {
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }

  // ── Volume slider ──────────────────────────────────────────────────────────
  function handleVolume(e) {
    setVolume(Number(e.target.value));
  }

  // Progress as a percentage, used to colour the filled portion of sliders
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <>
      {/* Hidden HTML5 audio element — does the actual playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-white/10 px-4 py-3 z-50">
        {/* ── Progress bar ── */}
        <div className="flex items-center gap-2 mb-2 max-w-3xl mx-auto">
          <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
            {formatDuration(currentTime)}
          </span>

          <div className="relative flex-1 h-1.5 group">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={!currentSong}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Track background */}
            <div className="h-full w-full rounded-full bg-white/20" />
            {/* Filled portion */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-purple-500 transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-xs text-gray-400 w-10 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>

        {/* ── Controls row ── */}
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Previous */}
          <button
            onClick={onPrev}
            disabled={!currentSong}
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
            disabled={!currentSong}
            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30
                       flex items-center justify-center transition shadow-lg"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              // Pause icon
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              // Play icon
              <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={!currentSong}
            className="text-gray-400 hover:text-white disabled:opacity-30 transition p-2"
            title="Next"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" />
            </svg>
          </button>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 w-32">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>

            <div className="relative flex-1 h-1.5">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolume}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="h-full w-full rounded-full bg-white/20" />
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-gray-400"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Player;
