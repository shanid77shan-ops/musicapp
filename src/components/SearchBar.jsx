import React from "react";

/**
 * SearchBar — controlled input with search icon, clear button, and loading spinner.
 *
 * Props:
 *   query      {string}   - current search text (controlled by App)
 *   onSearch   {fn}       - called with new value on every keystroke
 *   isLoading  {boolean}  - shows a spinner while Spotify is fetching
 */
function SearchBar({ query, onSearch, isLoading = false }) {
  return (
    <div className="relative w-full max-w-xl mx-auto">

      {/* Search icon (left) */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search Spotify by title or artist…"
        className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white/10 border border-white/20
                   text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2
                   focus:ring-purple-500 transition"
      />

      {/* Right side: spinner while loading, clear button when idle and text exists */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isLoading ? (
          // Spinning circle — visible while Spotify fetch is in-flight
          <svg
            className="w-4 h-4 text-purple-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : query ? (
          // Clear button — only when there is text
          <button
            onClick={() => onSearch("")}
            className="text-gray-400 hover:text-white transition"
            aria-label="Clear search"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default SearchBar;
