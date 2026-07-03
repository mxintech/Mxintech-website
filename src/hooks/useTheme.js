import { useEffect, useState } from 'react';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Light/dark theme state: restores the saved choice (lazily, so the save
 * effect can never clobber it), follows the OS preference until the user
 * picks one, and mirrors the value onto <html>/<body> data-theme plus
 * localStorage.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      if (localStorage.getItem('theme')) return;
      setTheme(event.matches ? 'dark' : 'light');
    };

    prefersDark.addEventListener('change', handleChange);
    return () => prefersDark.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
}
