import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  light: 'light',
  dark:  'dark',
  calm:  'calm',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('mindveda_theme') || 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('mindveda_theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(t => {
      if (t === 'dark')  return 'light';
      if (t === 'light') return 'calm';
      return 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
