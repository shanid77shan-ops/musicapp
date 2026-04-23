import React, { useState } from 'react';
import useMusicStore from '../store/useMusicStore';
import SearchBar    from '../components/SearchBar';
import SongList     from '../components/SongList';
import { formatDuration } from '../data/songs';

// ─── Genre / mood discovery chips (empty state) ───────────────────────────────
const GENRES = [
  { label: 'Pop',        query: 'pop hits 2024',        emoji: '🎤' },
  { label: 'Hip-Hop',    query: 'hip hop rap',           emoji: '🎧' },
  { label: 'Rock',       query: 'rock classics',         emoji: '🎸' },
  { label: 'K-Pop',      query: 'kpop',                  emoji: '✨' },
  { label: 'Bollywood',  query: 'bollywood hits',        emoji: '🎬' },
  { label: 'Lo-fi',      query: 'lofi chill beats',      emoji: '☕' },
  { label: 'R&B',        query: 'rnb soul',              emoji: '🎷' },
  { label: 'EDM',        query: 'edm dance music',       emoji: '🔊' },
  { label: 'Classical',  query: 'classical piano',       emoji: '🎹' },
  { label: 'Tamil',      query: 'tamil hits',            emoji: '🌟' },
  { label: 'Malayalam',  query: 'malayalam songs',       emoji: '🎶' },
  { label: 'Workout',    query: 'workout gym music',     emoji: '💪' },
];

// ─── Artist card ─────────────────────────────────────────────────────────────
function ArtistCard({ artist }) {
  return (
    <a
      href={artist.spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="flex-shrink-0 w-32 flex flex-col items-center gap-2 p-3 rounded-2xl
                 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10
                 transition cursor-pointer group"
    >
      {artist.image ? (
        <img src={artist.image} alt={artist.name}
             className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10
                        group-hover:ring-purple-500/50 transition" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center
                        justify-center text-2xl">🎤</div>
      )}
      <p className="text-xs text-white font-medium text-center truncate w-full">{artist.name}</p>
      {artist.genres[0] && (
        <p className="text-xs text-gray-500 truncate w-full text-center">{artist.genres[0]}</p>
      )}
    </a>
  );
}

// ─── Album card ──────────────────────────────────────────────────────────────
function AlbumCard({ album }) {
  return (
    <a
      href={album.spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="flex-shrink-0 w-36 flex flex-col gap-2 p-2 rounded-2xl
                 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10
                 transition cursor-pointer group"
    >
      {album.image ? (
        <img src={album.image} alt={album.name}
             className="w-full aspect-square rounded-xl object-cover
                        group-hover:opacity-90 transition" />
      ) : (
        <div className="w-full aspect-square rounded-xl bg-purple-600/20
                        flex items-center justify-center text-3xl">💿</div>
      )}
      <div className="px-1">
        <p className="text-xs text-white font-medium truncate">{album.name}</p>
        <p className="text-xs text-gray-500 truncate">{album.artist} · {album.year}</p>
      </div>
    </a>
  );
}

// ─── Top result card ─────────────────────────────────────────────────────────
function TopResultCard({ song, isActive, onSelect }) {
  return (
    <div
      onClick={() => onSelect(song)}
      className={`cursor-pointer p-5 rounded-2xl border transition
        ${isActive
          ? 'bg-purple-600/30 border-purple-500/50'
          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}`}
    >
      {song.albumArt && (
        <img src={song.albumArt} alt={song.album}
             className="w-24 h-24 rounded-xl object-cover mb-3 shadow-lg" />
      )}
      <p className="text-xl font-bold text-white truncate">{song.title}</p>
      <p className="text-sm text-gray-400 mt-1">{song.artist}</p>
      <p className="text-xs text-gray-500 mt-0.5">{song.album}</p>
      <span className="mt-3 inline-block text-xs px-2 py-0.5 rounded-full bg-white/10
                       text-gray-400">Song</span>
    </div>
  );
}

// ─── Pinned playlist card ─────────────────────────────────────────────────────
function PinnedCard({ playlist, currentSong, onSelect, onUnpin }) {
  const [open, setOpen] = useState(false);
  const cover = playlist.songs.find((s) => s.albumArt)?.albumArt;

  return (
    <div className="rounded-2xl bg-purple-900/20 border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden bg-purple-600/30
                        flex items-center justify-center">
          {cover
            ? <img src={cover} alt={playlist.name} className="w-full h-full object-cover" />
            : <span className="text-xl">🎵</span>}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setOpen((o) => !o)}>
          <p className="font-semibold text-white truncate text-sm">{playlist.name}</p>
          <p className="text-xs text-gray-400">
            📌 {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1.5 text-gray-400 hover:text-white transition"
        >
          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
               fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        <button
          onClick={onUnpin}
          title="Unpin"
          className="p-1.5 text-purple-400 hover:text-gray-400 transition text-sm"
        >
          📌
        </button>
      </div>

      {/* Song list (collapsible) */}
      {open && (
        <div className="border-t border-purple-500/20">
          {playlist.songs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No songs yet.</p>
          ) : (
            <ul className="divide-y divide-white/5 max-h-56 overflow-y-auto">
              {playlist.songs.map((song) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <li key={song.id}
                      onClick={() => onSelect(song)}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition
                        ${isActive ? 'bg-purple-600/20' : 'hover:bg-white/5'}`}>
                    {song.albumArt
                      ? <img src={song.albumArt} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      : <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-xs">🎵</div>}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isActive ? 'text-purple-300' : 'text-white'}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs text-gray-600 tabular-nums flex-shrink-0">
                      {formatDuration(song.duration)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function HomePage({ currentSong, onSelect, onAddToPlaylist }) {
  const {
    songs, artists, albums,
    isLoading, error, query, setQuery,
    searchHistory, clearHistory, removeFromHistory,
    playlists, pinnedPlaylistIds, togglePinPlaylist,
  } = useMusicStore();

  const pinnedPlaylists = playlists.filter((p) => pinnedPlaylistIds.includes(p.id));

  const [tab, setTab] = useState('all'); // 'all' | 'songs' | 'artists' | 'albums'

  const hasResults = songs.length > 0 || artists.length > 0 || albums.length > 0;
  const totalCount = songs.length + artists.length + albums.length;

  // Reset tab to 'all' whenever a new search fires
  const handleSearch = (q) => { setTab('all'); setQuery(q); };

  return (
    <>
      <SearchBar query={query} onSearch={handleSearch} isLoading={isLoading} />

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700/50
                        text-red-300 text-sm flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div>
            <p className="font-medium">Search failed</p>
            <p className="text-red-400 mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse"
                 style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Empty state (no query) ── */}
      {!isLoading && !query.trim() && (
        <>
          {/* Pinned playlists */}
          {pinnedPlaylists.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Pinned playlists
              </h2>
              <div className="space-y-2">
                {pinnedPlaylists.map((pl) => (
                  <PinnedCard
                    key={pl.id}
                    playlist={pl}
                    currentSong={currentSong}
                    onSelect={onSelect}
                    onUnpin={() => togglePinPlaylist(pl.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent searches */}
          {searchHistory.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Recent searches
                </h2>
                <button onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-gray-300 transition">
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((h) => (
                  <div key={h} className="flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full
                                          bg-white/10 border border-white/10 group">
                    <button
                      onClick={() => handleSearch(h)}
                      className="text-sm text-gray-300 hover:text-white transition"
                    >
                      🔍 {h}
                    </button>
                    <button
                      onClick={() => removeFromHistory(h)}
                      className="text-gray-600 hover:text-gray-300 transition ml-1 p-0.5
                                 rounded-full hover:bg-white/10"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genre / mood discovery */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Browse by genre
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {GENRES.map((g) => (
                <button
                  key={g.label}
                  onClick={() => handleSearch(g.query)}
                  className="flex flex-col items-center gap-1.5 p-4 rounded-2xl
                             bg-gradient-to-br from-white/10 to-white/5
                             hover:from-purple-600/40 hover:to-purple-800/30
                             border border-white/10 hover:border-purple-500/50
                             transition text-center"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-xs text-gray-300 font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {searchHistory.length === 0 && (
            <p className="text-center text-gray-600 text-sm mt-8">
              Or search for any song, artist, or album above
            </p>
          )}
        </>
      )}

      {/* ── Results ── */}
      {!isLoading && query.trim() && !error && hasResults && (
        <>
          {/* Result count + type tabs */}
          <div className="mt-4 mb-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              {totalCount} result{totalCount !== 1 ? 's' : ''} for
              <span className="text-gray-300 ml-1">"{query.trim()}"</span>
            </p>
            <div className="flex gap-1 bg-white/5 rounded-full p-1 text-xs">
              {[
                { id: 'all',     label: `All (${totalCount})` },
                { id: 'songs',   label: `Songs (${songs.length})` },
                { id: 'artists', label: `Artists (${artists.length})` },
                { id: 'albums',  label: `Albums (${albums.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1 rounded-full transition font-medium
                    ${tab === t.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* All tab: top result + artists row + albums row + songs */}
          {tab === 'all' && (
            <div className="space-y-6">
              {/* Top result */}
              {songs[0] && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Top result</h3>
                  <TopResultCard
                    song={songs[0]}
                    isActive={currentSong?.id === songs[0].id}
                    onSelect={onSelect}
                  />
                </div>
              )}

              {/* Artists */}
              {artists.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Artists</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
                  </div>
                </div>
              )}

              {/* Albums */}
              {albums.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Albums</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {albums.map((al) => <AlbumCard key={al.id} album={al} />)}
                  </div>
                </div>
              )}

              {/* Songs */}
              {songs.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                    Songs ({songs.length})
                  </h3>
                  <SongList
                    songs={songs}
                    currentSong={currentSong}
                    onSelect={onSelect}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                </div>
              )}
            </div>
          )}

          {/* Songs tab */}
          {tab === 'songs' && (
            <SongList
              songs={songs}
              currentSong={currentSong}
              onSelect={onSelect}
              onAddToPlaylist={onAddToPlaylist}
            />
          )}

          {/* Artists tab */}
          {tab === 'artists' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
            </div>
          )}

          {/* Albums tab */}
          {tab === 'albums' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {albums.map((al) => <AlbumCard key={al.id} album={al} />)}
            </div>
          )}
        </>
      )}

      {/* No results */}
      {!isLoading && query.trim() && !error && !hasResults && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-600">
          <span className="text-4xl">🔍</span>
          <p className="text-sm">No results for "{query.trim()}"</p>
        </div>
      )}
    </>
  );
}
