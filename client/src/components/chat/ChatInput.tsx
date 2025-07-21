import { memo, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { useChat } from '@/hooks/game/useChat';
import { useShortcuts } from '@/hooks/useShortcuts';

export const ChatInput = memo(() => {
  const { submitMessage, checkDisableInput, changeMessage, inputMessage } = useChat();

  const inputRef = useRef<HTMLInputElement | null>(null);

  useShortcuts([
    {
      key: 'CHAT',
      action: () => {
        // 현재 포커스된 요소가 없거나, 포커스된 요소가 body라면 input을 포커싱
        const isNoFocusedElement = !document.activeElement || document.activeElement === document.body;

        if (isNoFocusedElement) {
          inputRef.current?.focus();
        } else if (inputMessage.trim() === '') {
          inputRef.current?.blur();
        }
      },
      disabled: !inputRef.current, // input ref가 없을 때는 비활성화
    },
  ]);

  return (
    <form onSubmit={submitMessage} className="mt-1 w-full">
      <Input
        ref={inputRef}
        value={inputMessage}
        onChange={changeMessage}
        placeholder="메시지를 입력하세요"
        disabled={checkDisableInput()}
        autoComplete="off"
      />
    </form>
  );
});
