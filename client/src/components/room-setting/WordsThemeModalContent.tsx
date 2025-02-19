import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { gameSocketHandlers } from '@/handlers/socket/gameSocket.handler';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { useToastStore } from '@/stores/toast.store';
import { WordsThemeValidationMessage } from '@/types/wordsTheme.types';
import { cn } from '@/utils/cn';
import { validateWordsTheme } from '@/utils/wordsThemeValidation';

interface WordsThemeModalContentProps {
  isModalOpened: boolean;
  closeModal: () => void;
}

const WordsThemeModalContent = ({ isModalOpened, closeModal }: WordsThemeModalContentProps) => {
  const roomSettings = useGameSocketStore((state) => state.roomSettings);
  const actions = useGameSocketStore((state) => state.actions);
  const [wordsTheme, setWordsTheme] = useState(roomSettings?.wordsTheme || '');
  const [validationMessages, setValidationMessages] = useState<WordsThemeValidationMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useToastStore((state) => state.actions.addToast);

  useEffect(() => {
    if (isModalOpened) {
      setWordsTheme(roomSettings?.wordsTheme || '');
    }
  }, [isModalOpened, roomSettings?.wordsTheme]);

  // 실시간 입력 검증
  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, ' ');
    setWordsTheme(value);
    setValidationMessages(validateWordsTheme(value));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 현재 validationMessages 상태를 활용하여 검증
    const hasErrors = validationMessages.some((msg) => msg.type === 'error');
    if (hasErrors || !wordsTheme.trim()) {
      addToast({
        title: '입력 오류',
        description: '모든 입력 조건을 만족해야 합니다.',
        variant: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await gameSocketHandlers.updateSettings({
        settings: { wordsTheme: wordsTheme.trim() },
      });

      if (roomSettings) {
        actions.updateRoomSettings({
          ...roomSettings,
          wordsTheme: wordsTheme.trim(),
        });
      }

      addToast({
        title: '테마 설정 완료',
        description: `제시어 테마가 '${wordsTheme.trim()}'(으)로 설정되었습니다.`,
        variant: 'success',
        duration: 2000,
      });

      closeModal();
    } catch (err) {
      console.error(err);
      addToast({
        title: '설정 실패',
        description: '테마 설정 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 제출 가능 여부 확인
  const isSubmitDisabled = validationMessages.some((msg) => msg.type === 'error') || !wordsTheme.trim() || isSubmitting;

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => void handleSubmit(e)} className="flex flex-col">
      <span className="text-center text-lg text-eastbay-800">
        게임에서 사용될 제시어의 테마를 설정해보세요!
        <br />
        <span className="text-base text-eastbay-600">예시) 동물, 음식, 직업, 캐릭터, 스포츠 등 1가지 테마 입력</span>
      </span>

      <div className="space-y-2">
        <Input
          placeholder="동물, 음식, 직업, 캐릭터, 스포츠 등"
          value={wordsTheme}
          onChange={handleThemeChange}
          maxLength={20}
          disabled={isSubmitting}
          className={cn(
            validationMessages.some((msg) => msg.type === 'error') && 'border-red-500',
            validationMessages.some((msg) => msg.type === 'success') && 'border-green-500',
          )}
        />

        {/* 입력 조건 안내 */}
        <div className="rounded-md bg-violet-50 p-3 text-sm">
          <p className="font-medium">입력 조건:</p>
          <ul className="ml-4 list-disc space-y-1 text-eastbay-700">
            <li>2자 이상 20자 이하로 입력해주세요</li>
            <li>초성만 사용할 수 없습니다</li>
            <li>일부 특수문자(.,:? 등)만 사용할 수 있습니다</li>
            <li>부적절한 단어는 사용할 수 없습니다</li>
          </ul>
        </div>

        {/* 실시간 검증 메시지 */}
        <div className="space-y-1">
          {validationMessages.map((msg, index) => (
            <p
              key={index}
              className={cn(
                'text-sm',
                msg.type === 'error' && 'text-red-500',
                msg.type === 'warning' && 'text-yellow-600',
                msg.type === 'success' && 'text-green-500',
              )}
            >
              {msg.type === 'error' && '❌ '}
              {msg.type === 'warning' && '⚠️ '}
              {msg.type === 'success' && '✅ '}
              {msg.message}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button type="button" onClick={closeModal} variant="secondary" className="flex-1" disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitDisabled} className="flex-1">
          {isSubmitting ? '처리 중...' : '확인'}
        </Button>
      </div>
    </form>
  );
};

export { WordsThemeModalContent };
