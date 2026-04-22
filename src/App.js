import React, { useState, useMemo } from "react";
import songs from "./data/songs";
import SearchBar from "./components/SearchBar";
import SongList from "./components/SongList";
import Player from "./components/Player";
import NowPlaying from "./components/NowPlaying";

function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");                // search input text
  const [currentSong, setCurrentSong] = useState(null); // currently loaded song

  // ── Filtered list updates in real-time as the user types ───────────────────
  const filteredSongs = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return songs;
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
    );
  }, [query]);

  // ── Select a song from the list ────────────────────────────────────────────
  function handleSelect(song) {
    setCurrentSong(song);
  }

  // ── Next / Previous navigate the FULL playlist (not just the filtered view) ─
  function handleNext() {
    if (!currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    setCurrentSong(songs[(idx + 1) % songs.length]);
  }

  function handlePrev() {
    if (!currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    setCurrentSong(songs[(idx - 1 + songs.length) % songs.length]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-white">

      {/* ── Header ── */}
      <header className="px-6 pt-8 pb-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎵 MusicApp
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {songs.length} songs · Click any track to play
          </p>
          <SearchBar query={query} onSearch={setQuery} />
        </div>
      </header>

      {/* ── Song list ── */}
      <main className="px-6 pb-36 max-w-3xl mx-auto">
        {/* Column headers (desktop only) */}
        <div className="hidden md:flex items-center gap-4 px-4 mb-2 text-xs text-gray-500 uppercase tracking-wider">
          <span className="w-5" />
          <span className="w-10" />
          <span className="flex-1">Title / Artist</span>
          <span className="w-[120px]">Album</span>
          <span className="w-12 text-right">Time</span>
        </div>

        <SongList
          songs={filteredSongs}
          currentSong={currentSong}
          onSelect={handleSelect}
        />
      </main>

      {/* ── Player bar fixed at the bottom ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Now-playing info overlaid on the left of the player bar */}
        <div className="absolute left-4 bottom-[52px] hidden sm:block">
          <NowPlaying song={currentSong} />
        </div>

        <Player
          currentSong={currentSong}
          playlist={songs}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>
    </div>
  );
}

export default App;
