import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('chat_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark'; // Sleek modern dark default
  });

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('chat_theme', theme);
  }, [theme]);

  // Listen to system color-scheme changes if user hasn't manually set preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const saved = localStorage.getItem('chat_theme_user_selected');
      if (!saved) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('chat_theme_user_selected', 'true');
      return nextTheme;
    });
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      localStorage.setItem('chat_theme_user_selected', 'true');
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
