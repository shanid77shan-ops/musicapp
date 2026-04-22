import React, { useState } from "react";
import useMusicStore        from "./store/useMusicStore";
import { useSpotifyAuth }   from "./hooks/useSpotifyAuth";
import { useSpotifyPlayer } from "./hooks/useSpotifyPlayer";
import SearchBar  from "./components/SearchBar";
import SongList   from "./components/SongList";
import Player     from "./components/Player";
import NowPlaying from "./components/NowPlaying";

// ─────────────────────────────────────────────────────────────────────────────
// Login screen
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950
                    flex flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400
                       bg-clip-text text-transparent mb-3">
          🎵 MusicApp
        </h1>
        <p className="text-gray-400 max-w-sm">
          Search and stream full tracks via Spotify.
          A Premium account is required for full playback.
        </p>
      </div>

      <button
        onClick={onLogin}
        className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm
                   bg-[#1DB954] hover:bg-[#1ed760] text-black transition-all
                   shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373
                   12-12S18.627 0 12 0zm5.516 17.332a.75.75 0 0 1-1.03.25
                   c-2.822-1.724-6.376-2.114-10.56-1.158a.75.75 0 0
                   1-.334-1.463c4.579-1.045 8.507-.595 11.674 1.34a.75.75
                   0 0 1 .25 1.031zm1.47-3.27a.937.937 0 0 1-1.288.308
                   c-3.226-1.982-8.144-2.558-11.963-1.4a.937.937 0 1
                   1-.544-1.793c4.36-1.323 9.782-.682 13.487 1.597a.937.937
                   0 0 1 .308 1.288zm.127-3.408C15.596 8.424 9.405 8.224
                   5.961 9.31a1.125 1.125 0 1 1-.652-2.15C9.49 5.938
                   16.32 6.17 20.144 8.502a1.125 1.125 0 0 1-1.031 1.152z"/>
        </svg>
        Connect with Spotify
      </button>

      <p className="text-xs text-gray-600 max-w-xs">
        We only request access to your profile and playback.
        Tokens are stored only in your browser.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main app
// ─────────────────────────────────────────────────────────────────────────────
function MusicApp({ onLogout }) {
  const { songs, isLoading, error: searchError, query, setQuery } = useMusicStore();
  const [currentSong, setCurrentSong] = useState(null);

  const {
    isReady,
    playerState,
    error:       playerError,
    playTrack,
    pause,
    resume,
    seek,
    setVolume,
  } = useSpotifyPlayer();

  // ── Song selection ─────────────────────────────────────────────────────────
  function handleSelect(song) {
    setCurrentSong(song);
    playTrack(song.id);
  }

  // ── Next / Prev ────────────────────────────────────────────────────────────
  // SDK previousTrack/nextTrack work within a queue, but since we're playing
  // single tracks by URI, we manually pick from the search results list.
  function handleNext() {
    if (!songs.length) return;
    const idx     = currentSong ? songs.findIndex((s) => s.id === currentSong.id) : -1;
    const next    = songs[(idx + 1) % songs.length];
    setCurrentSong(next);
    playTrack(next.id);
  }

  function handlePrev() {
    if (!songs.length) return;
    const idx     = currentSong ? songs.findIndex((s) => s.id === currentSong.id) : -1;
    const prevIdx = idx <= 0 ? songs.length - 1 : idx - 1;
    const prev    = songs[prevIdx];
    setCurrentSong(prev);
    playTrack(prev.id);
  }

  const subtitle = isLoading
    ? 'Searching Spotify…'
    : searchError
    ? null
    : query.trim()
    ? `${songs.length} result${songs.length !== 1 ? 's' : ''} for "${query.trim()}"`
    : 'Type a song, artist, or album to search';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white">

      {/* ── Header ── */}
      <header className="px-6 pt-8 pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400
                           bg-clip-text text-transparent">
              🎵 MusicApp
            </h1>
            <div className="flex items-center gap-3">
              {/* SDK ready indicator */}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                isReady
                  ? 'text-green-400 border-green-500/30 bg-green-500/10'
                  : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 animate-pulse'
              }`}>
                {isReady ? '● Connected' : '◌ Connecting…'}
              </span>
              <button
                onClick={onLogout}
                className="text-xs text-gray-500 hover:text-gray-300 transition px-2 py-1
                           rounded border border-white/10 hover:border-white/20"
              >
                Disconnect
              </button>
            </div>
          </div>

          {subtitle && <p className="text-sm text-gray-400 mb-6">{subtitle}</p>}
          <SearchBar query={query} onSearch={setQuery} isLoading={isLoading} />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="px-6 pb-36 max-w-3xl mx-auto">

        {/* Player error (Premium required, etc.) */}
        {playerError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-900/40 border border-yellow-700/50
                          text-yellow-300 text-sm flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <p>{playerError}</p>
          </div>
        )}

        {/* Search error */}
        {searchError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700/50
                          text-red-300 text-sm flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div>
              <p className="font-medium">Spotify search failed</p>
              <p className="text-red-400 mt-0.5 text-xs">{searchError}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse"
                   style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* Song list */}
        {!isLoading && (
          <>
            {songs.length > 0 && (
              <div className="hidden md:flex items-center gap-4 px-4 mb-2 text-xs
                              text-gray-500 uppercase tracking-wider">
                <span className="w-5" />
                <span className="w-10" />
                <span className="flex-1">Title / Artist</span>
                <span className="w-[120px]">Album</span>
                <span className="w-12 text-right">Time</span>
              </div>
            )}

            {!query.trim() && !searchError && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-600">
                <svg className="w-14 h-14" fill="none" stroke="currentColor"
                     strokeWidth={1} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-sm">Search for any song, artist, or album</p>
              </div>
            )}

            {query.trim() && !searchError && (
              <SongList
                songs={songs}
                currentSong={currentSong}
                onSelect={handleSelect}
              />
            )}
          </>
        )}
      </main>

      {/* ── Player bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute left-4 bottom-[52px] hidden sm:block">
          <NowPlaying song={currentSong} />
        </div>
        <Player
          currentSong={currentSong}
          playerState={playerState}
          isReady={isReady}
          onPause={pause}
          onResume={resume}
          onSeek={seek}
          onVolume={setVolume}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const { login, logout, isAuthenticated } = useSpotifyAuth();
  if (!isAuthenticated) return <LoginScreen onLogin={login} />;
  return <MusicApp onLogout={logout} />;
}
