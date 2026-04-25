import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function NavBar({ page, onNavigate }) {
  const { isDark } = useTheme();

  const btn = (id, label, icon) => (
    <button
      onClick={() => onNavigate(id)}
      className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-full text-xs font-medium transition
        ${page === id
          ? 'bg-purple-600 text-white'
          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-[76px] left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className={`pointer-events-auto backdrop-blur border rounded-full px-1 py-1 flex gap-1 shadow-xl
        ${isDark
          ? 'bg-gray-900/90 border-white/10'
          : 'bg-white/90 border-gray-200'}`}>
        {btn('home',      'Home',      '🏠')}
        {btn('playlists', 'Playlists', '🎵')}
        {btn('settings',  'Settings',  '⚙️')}
      </div>
    </div>
  );
}
