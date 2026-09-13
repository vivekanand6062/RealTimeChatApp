import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { BsSunFill, BsMoonStarsFill } from 'react-icons/bs';

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700/60 shadow-md shadow-black/20'
          : 'bg-white/90 hover:bg-slate-100 text-indigo-600 border border-slate-200/80 shadow-md shadow-slate-300/40'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <BsSunFill className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <BsMoonStarsFill className="w-4 h-4 text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium pr-1 select-none">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
