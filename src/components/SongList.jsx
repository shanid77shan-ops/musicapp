import React from "react";
import { formatDuration } from "../data/songs";

// SongList: renders a scrollable list of song rows.
// Props:
//   songs         — array of song objects to display
//   currentSong   — the song currently loaded in the player (can be null)
//   onSelect      — callback when the user clicks a row
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
            {/* Track number or playing indicator */}
            <span className="w-5 text-center text-xs text-gray-400 flex-shrink-0">
              {isActive ? (
                // Animated bars to signal "now playing"
                <span className="inline-flex items-end gap-px h-4">
                  <span className="w-0.5 bg-purple-400 animate-bounce" style={{ height: "60%", animationDelay: "0ms" }} />
                  <span className="w-0.5 bg-purple-400 animate-bounce" style={{ height: "100%", animationDelay: "150ms" }} />
                  <span className="w-0.5 bg-purple-400 animate-bounce" style={{ height: "40%", animationDelay: "300ms" }} />
                </span>
              ) : (
                index + 1
              )}
            </span>

            {/* Album thumbnail */}
            <img
              src={song.thumbnail}
              alt={`${song.album} cover`}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />

            {/* Title + artist */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isActive ? "text-purple-300" : "text-white"}`}>
                {song.title}
              </p>
              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>

            {/* Album name (hidden on small screens) */}
            <span className="hidden md:block text-xs text-gray-500 truncate max-w-[120px]">
              {song.album}
            </span>

            {/* Duration */}
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatDuration(song.duration)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default SongList;
