import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage({ onLogout }) {
  const { isDark, toggle } = useTheme();

  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-lg font-bold text-white mb-6">Settings</h2>

      {/* Dark / Light mode */}
      <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isDark ? '🌙' : '☀️'}</span>
          <div>
            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isDark ? 'Easy on the eyes at night' : 'Bright and clear'}
            </p>
          </div>
        </div>
        {/* Toggle switch */}
        <button
          onClick={toggle}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200
            ${isDark ? 'bg-purple-600' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200
              ${isDark ? 'left-7' : 'left-1'}`}
          />
        </button>
      </div>

      {/* About */}
      <div className={`px-5 py-4 rounded-2xl border space-y-3
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wider
          ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>About</p>
        <div className="flex items-center gap-3">
          <img src="/Icon.png" alt="Jokerly" className="w-10 h-10 rounded-xl shadow" />
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Jokerly</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Stream full tracks via Spotify
            </p>
          </div>
        </div>
      </div>

      {/* Disconnect */}
      <div className={`px-5 py-4 rounded-2xl border
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-3
          ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Account</p>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                     bg-red-500/10 hover:bg-red-500/20 border border-red-500/30
                     text-red-400 hover:text-red-300 transition text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Disconnect Spotify
        </button>
      </div>
    </div>
  );
}
