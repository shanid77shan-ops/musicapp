import React from "react";

// SearchBar: a controlled input that calls onSearch whenever the user types.
// `query` is the current search string held in App state.
function SearchBar({ query, onSearch }) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Search icon */}
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
        placeholder="Search by title or artist…"
        className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white/10 border border-white/20
                   text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2
                   focus:ring-purple-500 transition"
      />

      {/* Clear button — only visible when there is text */}
      {query && (
        <button
          onClick={() => onSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
