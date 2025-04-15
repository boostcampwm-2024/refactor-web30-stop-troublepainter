import { DependencyList, useEffect } from 'react';
import { ShortcutKey } from '@/types/shorcut.types';

interface ShortcutConfig {
  key: ShortcutKey;
  action: () => void;
}

export const useShortcuts = (configs: ShortcutConfig[], dependencies: DependencyList = []) => {
  // 키보드 이벤트로부터 단축키 문자열 생성
  const createShortcutFromEvent = (event: KeyboardEvent): string => {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.key) parts.push(event.key.toLowerCase());

    return parts.join('+');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { target } = event;

      // input 요소에서는 단축키 비활성화
      if (
        (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLElement && target.isContentEditable)) &&
        event.key !== 'Enter' // 엔터 키는 예외
      ) {
        return;
      }

      const shortcutKey = createShortcutFromEvent(event);

      for (const config of configs) {
        if (config.key.toLowerCase() === shortcutKey) {
          config.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [configs, ...dependencies]);
};
