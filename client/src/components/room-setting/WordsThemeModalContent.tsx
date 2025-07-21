import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGameSetting } from '@/hooks/game/useGameSetting';
import { cn } from '@/utils/cn';

interface WordsThemeModalContentProps {
  closeModal: () => void;
  settingTool: ReturnType<typeof useGameSetting>;
}

const WordsThemeModalContent = ({ closeModal, settingTool }: WordsThemeModalContentProps) => {
  const { changeTheme, submitTheme, isThemeSubmitDisabled, wordsTheme, isThemeSubmitting, themeValidationMessages } =
    settingTool;

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => void submitTheme(e, closeModal)} className="flex flex-col">
      <span className="text-center text-lg text-eastbay-800">
        게임에서 사용될 제시어의 테마를 설정해보세요!
        <br />
        <span className="text-base text-eastbay-600">예시) 동물, 음식, 직업, 캐릭터, 스포츠 등 1가지 테마 입력</span>
      </span>

      <div className="space-y-2">
        <Input
          placeholder="동물, 음식, 직업, 캐릭터, 스포츠 등"
          value={wordsTheme}
          onChange={changeTheme}
          maxLength={20}
          disabled={isThemeSubmitting}
          className={cn(
            themeValidationMessages.some((msg) => msg.type === 'error') && 'border-red-500',
            themeValidationMessages.some((msg) => msg.type === 'success') && 'border-green-500',
          )}
        />

        {/* 입력 조건 안내 */}
        <div className="rounded-md bg-violet-50 p-3 text-sm">
          <p className="font-medium">입력 조건:</p>
          <ul className="ml-4 list-disc space-y-1 text-eastbay-700">
            <li>2자 이상 20자 이하로 입력해주세요</li>
            <li>초성은 사용할 수 없습니다</li>
            <li>일부 특수문자(.,:? 등)만 사용할 수 있습니다</li>
            <li>부적절한 단어는 사용할 수 없습니다</li>
          </ul>
        </div>

        {/* 실시간 검증 메시지 */}
        <div className="space-y-1">
          {themeValidationMessages.map((msg, index) => (
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
        <Button type="button" onClick={closeModal} variant="secondary" className="flex-1" disabled={isThemeSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isThemeSubmitDisabled} className="flex-1">
          {isThemeSubmitting ? '처리 중...' : '확인'}
        </Button>
      </div>
    </form>
  );
};

export { WordsThemeModalContent };
