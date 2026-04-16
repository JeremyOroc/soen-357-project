// Dark/light theme hook — syncs with localStorage and the system preference
import { useEffect, useState } from 'react';

const THEME_KEY = 'kmf_theme';

export function useTheme() {
  // On first load, use saved preference or fall back to OS setting
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle the "dark" class on <html> and persist the choice
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
 