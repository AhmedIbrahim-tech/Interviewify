'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--primary-text)] hover:bg-[var(--surface-elevated)] transition-theme"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
    </button>
  );
}
