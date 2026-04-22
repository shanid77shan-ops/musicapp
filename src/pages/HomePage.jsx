import React from 'react';
import useMusicStore from '../store/useMusicStore';
import SearchBar    from '../components/SearchBar';
import SongList     from '../components/SongList';

export default function HomePage({ currentSong, onSelect, onAddToPlaylist }) {
  const {
    songs, isLoading, error, query, setQuery,
    searchHistory, clearHistory,
  } = useMusicStore();

  const subtitle = isLoading
    ? 'Searching Spotify…'
    : error
    ? null
    : query.trim()
    ? `${songs.length} result${songs.length !== 1 ? 's' : ''} for "${query.trim()}"`
    : null;

  return (
    <>
      <SearchBar query={query} onSearch={setQuery} isLoading={isLoading} />

      {subtitle && (
        <p className="text-sm text-gray-400 mt-3 mb-1">{subtitle}</p>
      )}

      {/* Search error */}
      {error && (
        <div className="mt-3 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700/50
                        text-red-300 text-sm flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div>
            <p className="font-medium">Spotify search failed</p>
            <p className="text-red-400 mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse"
                 style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {/* Recent searches — shown when search box is empty */}
          {!query.trim() && searchHistory.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-300">Recent searches</h2>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-gray-300 transition"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((h) => (
                  <button
                    key={h}
                    onClick={() => setQuery(h)}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-purple-600/40
                               border border-white/10 hover:border-purple-500/50
                               text-sm text-gray-300 hover:text-white transition"
                  >
                    🔍 {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!query.trim() && searchHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-600">
              <svg className="w-14 h-14" fill="none" stroke="currentColor"
                   strokeWidth={1} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm">Search for any song, artist, or album</p>
            </div>
          )}

          {/* Column headers */}
          {query.trim() && !error && songs.length > 0 && (
            <div className="hidden md:flex items-center gap-4 px-4 mt-4 mb-2 text-xs
                            text-gray-500 uppercase tracking-wider">
              <span className="w-5" />
              <span className="w-10" />
              <span className="flex-1">Title / Artist</span>
              <span className="w-[120px]">Album</span>
              <span className="w-12 text-right">Time</span>
              <span className="w-6" />
            </div>
          )}

          {/* Results */}
          {query.trim() && !error && (
            <SongList
              songs={songs}
              currentSong={currentSong}
              onSelect={onSelect}
              onAddToPlaylist={onAddToPlaylist}
            />
          )}
        </>
      )}
    </>
  );
}
