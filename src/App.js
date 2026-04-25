import React, { useState, useEffect, useRef, useCallback } from "react";
import useMusicStore           from "./store/useMusicStore";
import { useSpotifyAuth }      from "./hooks/useSpotifyAuth";
import { useSpotifyPlayer }    from "./hooks/useSpotifyPlayer";
import NavBar                  from "./components/NavBar";
import Player                  from "./components/Player";
import NowPlaying              from "./components/NowPlaying";
import AddToPlaylistModal      from "./components/AddToPlaylistModal";
import HomePage                from "./pages/HomePage";
import PlaylistPage            from "./pages/PlaylistPage";
import SettingsPage            from "./pages/SettingsPage";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center
      ${isDark
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950'
        : 'bg-gradient-to-br from-slate-100 via-purple-50 to-indigo-100'}`}>
      <div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/Icon.png" alt="Jokerly" className="w-14 h-14 rounded-2xl shadow-lg shadow-purple-900/40" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400
                         bg-clip-text text-transparent">
            Jokerly
          </h1>
        </div>
        <p className={isDark ? 'text-gray-400 max-w-sm' : 'text-gray-600 max-w-sm'}>
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

      <p className={`text-xs max-w-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        We only request access to your profile and playback.
        Tokens are stored only in your browser.
      </p>
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────
function MusicApp({ onLogout }) {
  const { isDark } = useTheme();
  const { songs, fetchUserProfile, spotifyUserId } = useMusicStore();
  const [page, setPage] = useState('home');

  // Load user profile + playlists on mount
  useEffect(() => {
    if (!spotifyUserId) {
      fetchUserProfile();
    } else {
      useMusicStore.getState().loadPlaylists(spotifyUserId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentSong, setCurrentSong] = useState(null);
  const [modalSong,   setModalSong]   = useState(null);

  // Playback modes
  const [shuffle, setShuffle] = useState(false);
  const [repeat,  setRepeat]  = useState('off'); // 'off' | 'all' | 'one'

  const {
    isReady, playerState, error: playerError,
    playTrack, pause, resume, seek, setVolume,
  } = useSpotifyPlayer();

  // ── Auto-play next when song ends ────────────────────────────────────────
  const prevPausedRef   = useRef(false);
  const prevPositionRef = useRef(0);
  const currentSongRef  = useRef(currentSong);
  currentSongRef.current = currentSong;

  const handleNext = useCallback(() => {
    if (!songs.length || !currentSongRef.current) return;
    const idx = songs.findIndex((s) => s.id === currentSongRef.current.id);
    let next;
    if (shuffle) {
      const pool = songs.filter((_, i) => i !== idx);
      next = pool[Math.floor(Math.random() * pool.length)] ?? songs[0];
    } else {
      next = songs[(idx + 1) % songs.length];
    }
    setCurrentSong(next);
    playTrack(next.id);
  }, [songs, shuffle, playTrack]);

  const handlePrev = useCallback(() => {
    if (!songs.length || !currentSongRef.current) return;
    const idx  = songs.findIndex((s) => s.id === currentSongRef.current.id);
    const prev = songs[idx <= 0 ? songs.length - 1 : idx - 1];
    setCurrentSong(prev);
    playTrack(prev.id);
  }, [songs, playTrack]);

  useEffect(() => {
    if (!playerState) return;
    const wasPaused = prevPausedRef.current;
    if (!wasPaused && playerState.paused && playerState.position === 0) {
      // Song just ended
      if (repeat === 'one' && currentSongRef.current) {
        playTrack(currentSongRef.current.id);
      } else if (repeat === 'all' || shuffle) {
        handleNext();
      } else if (repeat === 'off') {
        handleNext();
      }
    }
    prevPausedRef.current   = playerState.paused;
    prevPositionRef.current = playerState.position;
  }, [playerState, repeat, handleNext, playTrack, shuffle]);

  function handleSelect(song) {
    setCurrentSong(song);
    playTrack(song.id);
  }

  function handleShuffleToggle() { setShuffle((s) => !s); }
  function handleRepeatToggle()  {
    setRepeat((r) => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off');
  }

  const bg = isDark
    ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white'
    : 'bg-gradient-to-br from-slate-100 via-purple-50 to-indigo-100 text-gray-900';

  const headerBorder = isDark ? 'border-white/5' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* ── Header ── */}
      <header className={`px-6 pt-8 pb-2 border-b ${headerBorder}`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/Icon.png" alt="Jokerly" className="w-8 h-8 rounded-xl" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400
                             bg-clip-text text-transparent">
                Jokerly
              </h1>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              isReady
                ? 'text-green-400 border-green-500/30 bg-green-500/10'
                : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 animate-pulse'
            }`}>
              {isReady ? '● Connected' : '◌ Connecting…'}
            </span>
          </div>

          {playerError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-900/40 border border-yellow-700/50
                            text-yellow-300 text-sm flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">⚠️</span>
              {playerError === 'REAUTH_REQUIRED' ? (
                <div>
                  <p className="font-medium">New permissions required</p>
                  <p className="text-yellow-400 text-xs mt-0.5">Please reconnect to grant the missing scopes.</p>
                  <button onClick={onLogout}
                    className="mt-2 px-3 py-1 text-xs rounded-full bg-yellow-500 hover:bg-yellow-400
                               text-black font-semibold transition">
                    Reconnect Spotify →
                  </button>
                </div>
              ) : (
                <p>{playerError}</p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="px-6 pb-52 max-w-3xl mx-auto pt-4">
        {page === 'home'      && <HomePage currentSong={currentSong} onSelect={handleSelect} onAddToPlaylist={setModalSong} />}
        {page === 'playlists' && <PlaylistPage currentSong={currentSong} onSelect={handleSelect} />}
        {page === 'settings'  && <SettingsPage onLogout={onLogout} />}
      </main>

      {/* ── Nav ── */}
      <NavBar page={page} onNavigate={setPage} />

      {/* ── Player ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute left-4 bottom-[110px] hidden sm:block">
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
          onAddToPlaylist={setModalSong}
          shuffle={shuffle}
          onShuffleToggle={handleShuffleToggle}
          repeat={repeat}
          onRepeatToggle={handleRepeatToggle}
        />
      </div>

      {/* ── Add-to-playlist modal ── */}
      {modalSong && (
        <AddToPlaylistModal song={modalSong} onClose={() => setModalSong(null)} />
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function AppInner() {
  const { login, logout, isAuthenticated } = useSpotifyAuth();
  if (!isAuthenticated) return <LoginScreen onLogin={login} />;
  return <MusicApp onLogout={logout} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
