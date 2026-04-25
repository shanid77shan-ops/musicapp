import React, { useState } from 'react';
import useMusicStore from '../store/useMusicStore';
import SearchBar    from '../components/SearchBar';
import SongList     from '../components/SongList';
import { formatDuration } from '../data/songs';
import { useTheme } from '../context/ThemeContext';

// ─── Artist card ─────────────────────────────────────────────────────────────
function ArtistCard({ artist }) {
  return (
    <a href={artist.spotifyUrl} target="_blank" rel="noreferrer"
       className="flex-shrink-0 w-28 flex flex-col items-center gap-2 p-3 rounded-2xl
                  bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10
                  transition cursor-pointer group">
      {artist.image
        ? <img src={artist.image} alt={artist.name}
               className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-purple-500/50 transition" />
        : <div className="w-14 h-14 rounded-full bg-purple-600/30 flex items-center justify-center text-2xl">🎤</div>}
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
    <a href={album.spotifyUrl} target="_blank" rel="noreferrer"
       className="flex-shrink-0 w-32 flex flex-col gap-2 p-2 rounded-2xl
                  bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10
                  transition cursor-pointer group">
      {album.image
        ? <img src={album.image} alt={album.name}
               className="w-full aspect-square rounded-xl object-cover group-hover:opacity-90 transition" />
        : <div className="w-full aspect-square rounded-xl bg-purple-600/20 flex items-center justify-center text-3xl">💿</div>}
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
    <div onClick={() => onSelect(song)}
         className={`cursor-pointer p-5 rounded-2xl border transition
           ${isActive
             ? 'bg-purple-600/30 border-purple-500/50'
             : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}`}>
      {song.albumArt && (
        <img src={song.albumArt} alt={song.album}
             className="w-24 h-24 rounded-xl object-cover mb-3 shadow-lg" />
      )}
      <p className="text-xl font-bold text-white truncate">{song.title}</p>
      <p className="text-sm text-gray-400 mt-1">{song.artist}</p>
      <p className="text-xs text-gray-500 mt-0.5">{song.album}</p>
      <span className="mt-3 inline-block text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">Song</span>
    </div>
  );
}

// ─── Pinned playlist card ─────────────────────────────────────────────────────
function PinnedCard({ playlist, currentSong, onSelect, onUnpin }) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const cover = playlist.songs.find((s) => s.albumArt)?.albumArt;

  return (
    <div className={`rounded-2xl border overflow-hidden
      ${isDark ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-100/60 border-purple-300/50'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden bg-purple-600/30 flex items-center justify-center">
          {cover
            ? <img src={cover} alt={playlist.name} className="w-full h-full object-cover" />
            : <span className="text-xl">🎵</span>}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setOpen((o) => !o)}>
          <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {playlist.name}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            📌 {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="p-1.5 text-gray-400 hover:text-white transition">
          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
               fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        </button>
        <button onClick={onUnpin} title="Unpin" className="p-1.5 text-purple-400 hover:text-gray-400 transition text-sm">
          📌
        </button>
      </div>

      {open && (
        <div className={`border-t ${isDark ? 'border-purple-500/20' : 'border-purple-200/50'}`}>
          {playlist.songs.length === 0
            ? <p className="text-sm text-gray-500 text-center py-4">No songs yet.</p>
            : (
              <ul className="divide-y divide-white/5 max-h-56 overflow-y-auto">
                {playlist.songs.map((song) => {
                  const isActive = currentSong?.id === song.id;
                  return (
                    <li key={song.id} onClick={() => onSelect(song)}
                        className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition
                          ${isActive ? 'bg-purple-600/20' : 'hover:bg-white/5'}`}>
                      {song.albumArt
                        ? <img src={song.albumArt} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-xs">🎵</div>}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isActive ? 'text-purple-300' : isDark ? 'text-white' : 'text-gray-900'}`}>
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
  const { isDark } = useTheme();
  const {
    songs, artists, albums,
    isLoading, error, query, setQuery,
    playlists, pinnedPlaylistIds, togglePinPlaylist,
  } = useMusicStore();

  const pinnedPlaylists = playlists.filter((p) => pinnedPlaylistIds.includes(p.id));
  const [tab, setTab] = useState('all');

  const hasResults  = songs.length > 0 || artists.length > 0 || albums.length > 0;
  const totalCount  = songs.length + artists.length + albums.length;

  const handleSearch = (q) => { setTab('all'); setQuery(q); };

  const txt     = isDark ? 'text-white'   : 'text-gray-900';
  const txtSub  = isDark ? 'text-gray-400': 'text-gray-500';
  const txtMute = isDark ? 'text-gray-500': 'text-gray-400';

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
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse"
                 style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Empty state (no query) ── */}
      {!isLoading && !query.trim() && (
        <>
          {/* Pinned playlists */}
          {pinnedPlaylists.length > 0 && (
            <div className="mt-5">
              <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${txtMute}`}>
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

          {/* Empty prompt */}
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <p className={`text-base font-semibold ${txt}`}>What do you want to listen to?</p>
            <p className={`text-sm ${txtSub}`}>Search for any song, artist or album</p>
          </div>
        </>
      )}

      {/* ── Results ── */}
      {!isLoading && query.trim() && !error && hasResults && (
        <>
          {/* Result count + type tabs */}
          <div className="mt-4 mb-4 flex items-center justify-between flex-wrap gap-3">
            <p className={`text-xs ${txtMute}`}>
              {totalCount} result{totalCount !== 1 ? 's' : ''} for
              <span className={`ml-1 ${txtSub}`}>"{query.trim()}"</span>
            </p>
            <div className={`flex gap-1 rounded-full p-1 text-xs ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              {[
                { id: 'all',     label: `All` },
                { id: 'songs',   label: `Songs` },
                { id: 'artists', label: `Artists` },
                { id: 'albums',  label: `Albums` },
              ].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-3 py-1 rounded-full transition font-medium
                    ${tab === t.id ? 'bg-purple-600 text-white' : `${txtSub} hover:${txt}`}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'all' && (
            <div className="space-y-6">
              {songs[0] && (
                <div>
                  <h3 className={`text-xs uppercase tracking-wider mb-3 ${txtMute}`}>Top result</h3>
                  <TopResultCard song={songs[0]} isActive={currentSong?.id === songs[0].id} onSelect={onSelect} />
                </div>
              )}
              {artists.length > 0 && (
                <div>
                  <h3 className={`text-xs uppercase tracking-wider mb-3 ${txtMute}`}>Artists</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
                  </div>
                </div>
              )}
              {albums.length > 0 && (
                <div>
                  <h3 className={`text-xs uppercase tracking-wider mb-3 ${txtMute}`}>Albums</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {albums.map((al) => <AlbumCard key={al.id} album={al} />)}
                  </div>
                </div>
              )}
              {songs.length > 0 && (
                <div>
                  <h3 className={`text-xs uppercase tracking-wider mb-3 ${txtMute}`}>Songs</h3>
                  <SongList songs={songs} currentSong={currentSong} onSelect={onSelect} onAddToPlaylist={onAddToPlaylist} />
                </div>
              )}
            </div>
          )}

          {tab === 'songs'   && <SongList songs={songs} currentSong={currentSong} onSelect={onSelect} onAddToPlaylist={onAddToPlaylist} />}
          {tab === 'artists' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
            </div>
          )}
          {tab === 'albums'  && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
