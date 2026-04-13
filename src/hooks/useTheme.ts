import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kmf_theme';

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return { dark, toggle };
}
