import React from 'react';

export default function NavBar({ page, onNavigate }) {
  const btn = (id, label, icon) => (
    <button
      onClick={() => onNavigate(id)}
      className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-full text-xs font-medium transition
        ${page === id
          ? 'bg-purple-600 text-white'
          : 'text-gray-400 hover:text-white'}`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-[76px] left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-gray-900/90 backdrop-blur border border-white/10
                      rounded-full px-1 py-1 flex gap-1 shadow-xl">
        {btn('home',      'Home',      '🏠')}
        {btn('playlists', 'Playlists', '🎵')}
      </div>
    </div>
  );
}
