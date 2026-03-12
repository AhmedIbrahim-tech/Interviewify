'use client';

import { Toaster } from 'sonner';
import { useTheme } from '@/components/layout/ThemeProvider';

/**
 * Renders the app toast container. Theme and colors are aligned via globals.css.
 * Must be inside ThemeProvider.
 */
export function NotifyToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      expand={false}
      richColors={false}
      closeButton
      duration={4500}
    />
  );
}
