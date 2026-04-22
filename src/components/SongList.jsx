import React from "react";
import { formatDuration } from "../data/songs";

function SongList({ songs, currentSong, onSelect }) {
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
            onClick={() => onSelect(song)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition
              ${
                isActive
                  ? "bg-purple-600/40 border border-purple-500/50"
                  : "hover:bg-white/10 border border-transparent"
              }`}
          >
            {/* Track number or animated playing bars */}
            <span className="w-5 text-center text-xs text-gray-400 flex-shrink-0">
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

            {/* Album art — falls back to a music note placeholder */}
            {song.albumArt ? (
              <img
                src={song.albumArt}
                alt={`${song.album} cover`}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center
                              flex-shrink-0 text-gray-500 text-lg">
                🎵
              </div>
            )}

            {/* Title + artist */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isActive ? "text-purple-300" : "text-white"}`}>
                {song.title}
              </p>
              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>

            {/* Album name — desktop only */}
            <span className="hidden md:block text-xs text-gray-500 truncate max-w-[120px]">
              {song.album}
            </span>

            {/* Duration */}
            <span className="text-xs text-gray-400 flex-shrink-0 w-10 text-right tabular-nums">
              {formatDuration(song.duration)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default SongList;
