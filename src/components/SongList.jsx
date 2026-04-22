import React from "react";
import { formatDuration } from "../data/songs";

function SongList({ songs, currentSong, onSelect, onAddToPlaylist }) {
  if (songs.length === 0) {
    return (
      <p className="text-center text-gray-400 py-12 text-sm">
        No songs match your search.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {songs.map((song, index) => {
        const isActive = currentSong?.id === song.id;

        return (
          <li
            key={song.id}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition group
              ${isActive
                ? "bg-purple-600/40 border border-purple-500/50"
                : "hover:bg-white/10 border border-transparent"}`}
          >
            {/* Track number / playing bars */}
            <span
              className="w-5 text-center text-xs text-gray-400 flex-shrink-0"
              onClick={() => onSelect(song)}
            >
              {isActive ? (
                <span className="inline-flex items-end gap-px h-4">
                  <span className="w-0.5 bg-purple-400 animate-bounce" style={{ height: "60%",  animationDelay: "0ms"   }} />
                  <span className="w-0.5 bg-purple-400 animate-bounce" style={{ height: "100%", animationDelay: "150ms" }} />
                  <span className="w-0.5 bg-purple-400 animate-bounce" style={{ height: "40%",  animationDelay: "300ms" }} />
                </span>
              ) : (
                index + 1
              )}
            </span>

            {/* Album art */}
            <div onClick={() => onSelect(song)} className="flex-shrink-0">
              {song.albumArt ? (
                <img
                  src={song.albumArt}
                  alt={`${song.album} cover`}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-gray-500 text-lg">
                  🎵
                </div>
              )}
            </div>

            {/* Title + artist */}
            <div className="flex-1 min-w-0" onClick={() => onSelect(song)}>
              <p className={`text-sm font-medium truncate ${isActive ? "text-purple-300" : "text-white"}`}>
                {song.title}
              </p>
              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>

            {/* Album — desktop only */}
            <span
              className="hidden md:block text-xs text-gray-500 truncate max-w-[120px]"
              onClick={() => onSelect(song)}
            >
              {song.album}
            </span>

            {/* Duration */}
            <span
              className="text-xs text-gray-400 flex-shrink-0 w-10 text-right tabular-nums"
              onClick={() => onSelect(song)}
            >
              {formatDuration(song.duration)}
            </span>

            {/* Add to playlist */}
            {onAddToPlaylist && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToPlaylist(song); }}
                title="Add to playlist"
                className="flex-shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-purple-400
                           hover:bg-purple-500/20 transition opacity-0 group-hover:opacity-100
                           focus:opacity-100"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default SongList;
