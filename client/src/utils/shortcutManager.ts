// shortcutManager.ts - 단축키 관리 모듈
const shortcutMap = new Map<string, () => void>();

export function shortcutManager() {
  const createShortcutFromEvent = (event: KeyboardEvent): string => {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.key) parts.push(event.key.toLowerCase());

    return parts.join('+');
  };

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

    if (!shortcutMap.has(shortcutKey)) return;
    shortcutMap.get(shortcutKey)?.();
  };

  const registerShortcut = (key: string, handler: () => void) => {
    shortcutMap.set(key.toLowerCase(), handler);
  };

  const clearShortcuts = () => {
    shortcutMap.clear();
  };

  return { handleKeyDown, registerShortcut, clearShortcuts };
}
