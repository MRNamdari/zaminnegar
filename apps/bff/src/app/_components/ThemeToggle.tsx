'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const THEME_KEY = 'theme';
const THEME_EVENT = 'app-theme-change';

function getCurrentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  window.dispatchEvent(new Event(THEME_EVENT));
}

export default function ThemeToggle({
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);

    const initialTheme: Theme =
      savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme
        : getCurrentTheme();

    applyTheme(initialTheme);
    setTheme(initialTheme);

    const syncTheme = () => {
      setTheme(getCurrentTheme());
    };

    window.addEventListener(THEME_EVENT, syncTheme);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
    };
  }, []);

  const toggleTheme = () => {
    const currentTheme = getCurrentTheme();
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={theme === null}
      aria-label={isDark ? 'فعال‌سازی حالت روشن' : 'فعال‌سازی حالت تاریک'}
      aria-pressed={isDark}
      title={isDark ? 'حالت روشن' : 'حالت تاریک'}
      className={`p-4 rounded-lg
    bg-background
    text-text
    font-medium
    transition duration-300
    cursor-pointer
    disabled:bg-action-primary/50
    disabled:cursor-not-allowed
    inline-flex items-center justify-center gap-2
    ${className}
  `}
    >
      {isDark ? (
        <Sun size={20} strokeWidth={1.8} />
      ) : (
        <Moon size={20} strokeWidth={1.8} />
      )}

      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? 'حالت روشن' : 'حالت تاریک'}
        </span>
      )}
    </button>
  );
}
