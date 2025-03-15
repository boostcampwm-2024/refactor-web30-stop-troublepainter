import { useEffect } from 'react';
import { shortcutManager } from '@/utils/shortcutManager';

export const usePageShortcutKeys = () => {
  const { handleKeyDown, clearShortcuts } = shortcutManager();
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearShortcuts();
    };
  }, []);
};
