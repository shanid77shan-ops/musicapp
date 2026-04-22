import React from "react";

// NowPlaying: a small card in the player bar showing what is currently loaded.
// If nothing is selected, shows a prompt to pick a song.
function NowPlaying({ song }) {
  if (!song) {
    return (
      <div className="flex items-center gap-3 w-48">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0" />
        <p className="text-xs text-gray-500">Select a song to play</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 w-48">
      <img
        src={song.albumArt}
        alt={song.title}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{song.title}</p>
        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
      </div>
    </div>
  );
}

export default NowPlaying;
