import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { gameSocketHandlers } from '@/handlers/socket/gameSocket.handler';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

interface CategoryModalContentContentProps {
  isModalOpened: boolean;
  closeModal: () => void;
}

const CategoryModalContentContent = ({ isModalOpened, closeModal }: CategoryModalContentContentProps) => {
  const roomSettings = useGameSocketStore((state) => state.roomSettings);
  const actions = useGameSocketStore((state) => state.actions);
  const [category, setCategory] = useState(roomSettings?.category || '');

  useEffect(() => {
    // 모달이 열릴 때마다 현재 카테고리로 초기화
    if (isModalOpened) {
      setCategory(roomSettings?.category || '');
    }
  }, [isModalOpened, roomSettings?.category]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category.trim()) return;

    const trimmedCategory = category.trim();

    // 서버에 업데이트 요청
    await gameSocketHandlers.updateSettings({
      settings: { category: trimmedCategory },
    });

    // 로컬 상태 업데이트
    if (roomSettings) {
      actions.updateRoomSettings({
        ...roomSettings,
        category: trimmedCategory,
      });
    }

    closeModal();
  };

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => void handleSubmit(e)} className="flex flex-col gap-4">
      <Input placeholder="카테고리를 입력하세요" value={category} onChange={(e) => setCategory(e.target.value)} />
      <div className="flex gap-2">
        <Button type="button" onClick={closeModal} variant="secondary" className="flex-1">
          취소
        </Button>
        <Button type="submit" disabled={!category.trim()} className="flex-1">
          확인
        </Button>
      </div>
    </form>
  );
};

export { CategoryModalContentContent };
