import React, { useState } from 'react';
import useMusicStore           from '../store/useMusicStore';
import { formatDuration }      from '../data/songs';

export default function PlaylistPage({ currentSong, onSelect }) {
  const { playlists, deletePlaylist, removeSongFromPlaylist, renamePlaylist } = useMusicStore();
  const [expanded,    setExpanded]    = useState(null);
  const [renamingId,  setRenamingId]  = useState(null);
  const [renameValue, setRenameValue] = useState('');

  function startRename(pl) {
    setRenamingId(pl.id);
    setRenameValue(pl.name);
  }

  function commitRename(id) {
    const name = renameValue.trim();
    if (name) renamePlaylist(id, name);
    setRenamingId(null);
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-600">
        <span className="text-5xl">🎵</span>
        <p className="text-sm text-center">
          No playlists yet.<br />
          Hit <span className="text-purple-400">+</span> on any song while it's playing to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {playlists.map((pl) => {
        const isOpen = expanded === pl.id;
        const cover  = pl.songs.find((s) => s.albumArt)?.albumArt;

        return (
          <div key={pl.id}
               className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">

            {/* Playlist header */}
            <div className="flex items-center gap-4 px-4 py-3">
              {/* Cover / icon */}
              <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-purple-600/30
                              flex items-center justify-center">
                {cover
                  ? <img src={cover} alt={pl.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl">🎵</span>}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                {renamingId === pl.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(pl.id)}
                    onKeyDown={(e) => e.key === 'Enter' && commitRename(pl.id)}
                    className="bg-transparent border-b border-purple-500 text-white text-sm
                               font-semibold outline-none w-full"
                  />
                ) : (
                  <p className="font-semibold text-white truncate">{pl.name}</p>
                )}
                <p className="text-xs text-gray-400">
                  {pl.songs.length} song{pl.songs.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startRename(pl)}
                  title="Rename"
                  className="p-2 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/10"
                >
                  ✏️
                </button>
                <button
                  onClick={() => { if (window.confirm(`Delete "${pl.name}"?`)) deletePlaylist(pl.id); }}
                  title="Delete playlist"
                  className="p-2 text-gray-500 hover:text-red-400 transition rounded-lg hover:bg-white/10"
                >
                  🗑️
                </button>
                <button
                  onClick={() => setExpanded(isOpen ? null : pl.id)}
                  className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/10"
                >
                  <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                       fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Song list */}
            {isOpen && (
              <div className="border-t border-white/10">
                {pl.songs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No songs yet.</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {pl.songs.map((song) => {
                      const isActive = currentSong?.id === song.id;
                      return (
                        <li key={song.id}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition
                              ${isActive ? 'bg-purple-600/20' : 'hover:bg-white/5'}`}>
                          {/* Album art */}
                          {song.albumArt
                            ? <img src={song.albumArt} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                            : <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-sm">🎵</div>
                          }
                          {/* Info */}
                          <div className="flex-1 min-w-0" onClick={() => onSelect(song)}>
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-purple-300' : 'text-white'}`}>
                              {song.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                          </div>
                          {/* Duration */}
                          <span className="text-xs text-gray-500 tabular-nums flex-shrink-0">
                            {formatDuration(song.duration)}
                          </span>
                          {/* Remove */}
                          <button
                            onClick={() => removeSongFromPlaylist(pl.id, song.id)}
                            className="p-1.5 text-gray-600 hover:text-red-400 transition rounded-lg flex-shrink-0"
                            title="Remove from playlist"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
