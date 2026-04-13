import React, { createContext, useContext, useState, useMemo } from 'react';

// Definición de las paletas de colores
export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    subtext: '#64748B',
    border: '#F1F5F9',
    accent: '#D97706',
    card: '#FFFFFF',
    error: '#EF4444',
    errorBg: '#FEE2E2',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    subtext: '#94A3B8',
    border: '#334155',
    accent: '#D97706',
    card: '#1E293B',
    error: '#F87171',
    errorBg: '#450a0a',
  }
};

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  colors: Colors.light,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    colors: Colors[theme],
    toggleTheme,
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);