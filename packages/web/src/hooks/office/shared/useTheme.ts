'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'office-theme';
const THEME_LIGHT = 'office-light';
const THEME_DARK = 'office-dark';

export type Theme = 'dark' | 'light';

export const useTheme = (): { theme: Theme; toggleTheme: () => void } => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    let stored: Theme | null = null;
    try {
      const raw = window.localStorage.getItem(THEME_KEY);
      if (raw === THEME_DARK) stored = 'dark';
      else if (raw === THEME_LIGHT) stored = 'light';
    } catch {
      // ignore storage errors
    }
    setTheme(stored ?? 'light');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'dark' ? THEME_DARK : THEME_LIGHT;
    try {
      window.localStorage.setItem(THEME_KEY, theme === 'dark' ? THEME_DARK : THEME_LIGHT);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  };
};
