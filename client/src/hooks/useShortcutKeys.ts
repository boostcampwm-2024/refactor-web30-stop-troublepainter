import { useEffect } from 'react';
import { shortcutManager } from '@/utils/shortcutManager';

export const useShortcutKeys = () => {
  const { handleKeyDown } = shortcutManager();
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
