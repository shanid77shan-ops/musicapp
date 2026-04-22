import React, { useState } from 'react';
import useMusicStore from '../store/useMusicStore';

export default function AddToPlaylistModal({ song, onClose }) {
  const { playlists, createPlaylist, addSongToPlaylist } = useMusicStore();
  const [newName, setNewName]     = useState('');
  const [showInput, setShowInput] = useState(false);
  const [added, setAdded]         = useState(null); // playlistId just added to

  function handleAdd(playlistId) {
    addSongToPlaylist(playlistId, song);
    setAdded(playlistId);
    setTimeout(onClose, 800);
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const id = createPlaylist(name);
    addSongToPlaylist(id, song);
    setAdded(id);
    setTimeout(onClose, 800);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full bg-gray-900 border-t border-white/10 rounded-t-2xl p-5 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Add to playlist</p>
            <p className="font-semibold text-white truncate">{song.title}</p>
            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white ml-4 flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Playlist list */}
        <div className="overflow-y-auto flex-1 space-y-2 mb-4">
          {playlists.length === 0 && !showInput && (
            <p className="text-sm text-gray-500 text-center py-6">No playlists yet — create one below.</p>
          )}
          {playlists.map((pl) => {
            const isAdded = added === pl.id;
            const alreadyIn = pl.songs.some((s) => s.id === song.id);
            return (
              <button
                key={pl.id}
                onClick={() => !alreadyIn && handleAdd(pl.id)}
                disabled={alreadyIn}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition
                  ${isAdded ? 'bg-green-600/30 border border-green-500/50'
                    : alreadyIn ? 'opacity-40 cursor-not-allowed bg-white/5'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-600/40 flex items-center justify-center flex-shrink-0 text-lg">
                  🎵
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{pl.name}</p>
                  <p className="text-xs text-gray-400">{pl.songs.length} song{pl.songs.length !== 1 ? 's' : ''}</p>
                </div>
                {isAdded && <span className="text-green-400 text-sm">✓ Added</span>}
                {alreadyIn && !isAdded && <span className="text-gray-500 text-xs">Already in</span>}
              </button>
            );
          })}
        </div>

        {/* Create new playlist */}
        {showInput ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Playlist name…"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5
                         text-sm text-white placeholder-gray-500 outline-none
                         focus:border-purple-500"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500
                         disabled:opacity-40 text-sm font-medium transition"
            >
              Create
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed
                       border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10
                       text-gray-400 hover:text-white transition"
          >
            <span className="text-xl">+</span>
            <span className="text-sm">New playlist</span>
          </button>
        )}
      </div>
    </div>
  );
}
