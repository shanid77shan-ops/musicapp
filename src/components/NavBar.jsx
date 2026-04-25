import React from 'react';
import { useTheme } from '../context/ThemeContext';

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);
const PlaylistIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
  </svg>
);
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

export default function NavBar({ page, onNavigate }) {
  const { isDark } = useTheme();

  const btn = (id, label, Icon) => (
    <button
      onClick={() => onNavigate(id)}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition
        ${page === id
          ? 'text-purple-400'
          : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
    >
      <Icon />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className={`fixed bottom-[92px] left-0 right-0 z-40 border-t
      ${isDark ? 'bg-gray-950/95 border-white/10' : 'bg-white/95 border-gray-200'}
      backdrop-blur`}>
      <div className="flex max-w-lg mx-auto">
        {btn('home',      'Home',      HomeIcon)}
        {btn('playlists', 'Playlists', PlaylistIcon)}
        {btn('settings',  'Settings',  SettingsIcon)}
      </div>
    </div>
  );
}
