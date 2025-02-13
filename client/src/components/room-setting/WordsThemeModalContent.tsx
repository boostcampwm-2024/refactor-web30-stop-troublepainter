import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { gameSocketHandlers } from '@/handlers/socket/gameSocket.handler';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

interface WordsThemeModalContentContentProps {
  isModalOpened: boolean;
  closeModal: () => void;
}

const WordsThemeModalContentContent = ({ isModalOpened, closeModal }: WordsThemeModalContentContentProps) => {
  const roomSettings = useGameSocketStore((state) => state.roomSettings);
  const actions = useGameSocketStore((state) => state.actions);
  const [wordsTheme, setWordsTheme] = useState(roomSettings?.wordsTheme || '');

  useEffect(() => {
    // 모달이 열릴 때마다 현재 제시어 테마로 초기화
    if (isModalOpened) {
      setWordsTheme(roomSettings?.wordsTheme || '');
    }
  }, [isModalOpened, roomSettings?.wordsTheme]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!wordsTheme.trim()) return;

    const trimmedWordsTheme = wordsTheme.trim();

    // 서버에 업데이트 요청
    await gameSocketHandlers.updateSettings({
      settings: { wordsTheme: trimmedWordsTheme },
    });

    // 로컬 상태 업데이트
    if (roomSettings) {
      actions.updateRoomSettings({
        ...roomSettings,
        wordsTheme: trimmedWordsTheme,
      });
    }

    closeModal();
  };

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => void handleSubmit(e)} className="flex flex-col gap-3">
      <span className="text-center text-lg text-eastbay-800">
        게임에서 사용될 제시어의 테마를 설정해보세요!
        <br />
        <span className="text-base text-eastbay-600">예시) 동물, 음식, 직업, 캐릭터, 스포츠 등 1가지 테마 입력</span>
      </span>

      <Input
        placeholder="동물, 음식, 직업, 캐릭터, 스포츠 등"
        value={wordsTheme}
        onChange={(e) => setWordsTheme(e.target.value)}
      />

      {/* 입력 가이드 메시지 추가 */}
      <span className="text-center text-base text-eastbay-500">입력한 테마를 바탕으로 AI가 제시어를 생성합니다.</span>

      <div className="flex gap-2">
        <Button type="button" onClick={closeModal} variant="secondary" className="flex-1">
          취소
        </Button>
        <Button type="submit" disabled={!wordsTheme.trim()} className="flex-1">
          확인
        </Button>
      </div>
    </form>
  );
};

export { WordsThemeModalContentContent };
