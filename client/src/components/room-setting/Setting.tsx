import { HTMLAttributes, memo, useCallback, useEffect, useState } from 'react';
import { RoomSettings } from '@troublepainter/core';
import { SettingContent } from '@/components/room-setting/SettingContent';
import { WordsThemeModalContent } from '@/components/room-setting/WordsThemeModalContent';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SHORTCUT_KEYS } from '@/constants/shortcutKeys';
import { gameSocketHandlers } from '@/handlers/socket/gameSocket.handler';
import { useModal } from '@/hooks/useModal';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { ShortcutKey } from '@/types/shorcut.types';
import { cn } from '@/utils/cn';

type SettingKey = keyof RoomSettings;

export interface RoomSettingItem {
  key: SettingKey;
  label: string;
  options: number[];
  shortcutKey: ShortcutKey;
}

export const ROOM_SETTINGS: RoomSettingItem[] = [
  {
    label: '라운드 수',
    key: 'totalRounds',
    options: [3, 5, 7, 9, 11],
    shortcutKey: SHORTCUT_KEYS.DROPDOWN_TOTAL_ROUNDS.key,
  },
  {
    label: '최대 플레이어 수',
    key: 'maxPlayers',
    options: [4, 5],
    shortcutKey: SHORTCUT_KEYS.DROPDOWN_MAX_PLAYERS.key,
  },
  { label: '제한 시간', key: 'drawTime', options: [15, 20, 25, 30], shortcutKey: SHORTCUT_KEYS.DROPDOWN_DRAW_TIME.key },
  //{ label: '픽셀 수', key: 'maxPixels', options: [300, 500] },
];

const Setting = memo(({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  // 개별 selector로 필요한 상태만 구독
  const roomSettings = useGameSocketStore((state) => state.roomSettings);
  const isHost = useGameSocketStore((state) => state.isHost);
  const actions = useGameSocketStore((state) => state.actions);
  // 모달
  const { isModalOpened, openModal, closeModal, handleKeyDown } = useModal();

  const [selectedValues, setSelectedValues] = useState<RoomSettings>(
    roomSettings ?? {
      totalRounds: 5,
      maxPlayers: 5,
      drawTime: 30,
    },
  );

  useEffect(() => {
    if (!roomSettings) return;
    setSelectedValues(roomSettings);
  }, [roomSettings]);

  const handleSettingChange = useCallback(
    (key: keyof RoomSettings, value: string) => {
      const newSettings = {
        ...selectedValues,
        [key]: Number(value),
      };
      setSelectedValues(newSettings);
      void gameSocketHandlers.updateSettings({
        settings: { ...newSettings, drawTime: newSettings.drawTime + 5 },
      });
      actions.updateRoomSettings(newSettings);
    },
    [selectedValues, actions],
  );

  // 제시어 테마
  const headerText = roomSettings?.wordsTheme ? roomSettings.wordsTheme : 'Setting';

  return (
    <section
      className={cn('flex w-full flex-col border-0 border-violet-950 sm:rounded-xl sm:border-2', className)}
      {...props}
    >
      {/* Setting title */}
      <div className="flex h-14 w-full items-center justify-between border-0 border-violet-950 bg-violet-500 px-4 sm:h-16 sm:rounded-t-[0.625rem] sm:border-b-2">
        <h2 className="text-2xl text-white text-stroke-md sm:translate-y-1 lg:text-3xl">{headerText}</h2>
        {isHost && (
          <Button
            variant="secondary"
            size={'text'}
            onClick={openModal}
            className="h-10 w-28 text-lg lg:w-32 lg:text-xl"
          >
            제시어 테마
          </Button>
        )}
      </div>

      {/* Setting content */}
      <Modal
        title="제시어 테마 설정"
        isModalOpened={isModalOpened}
        closeModal={closeModal}
        handleKeyDown={handleKeyDown} // handleKeyDown 추가
        className="min-w-72 max-w-lg"
      >
        <WordsThemeModalContent isModalOpened={isModalOpened} closeModal={closeModal} />
      </Modal>
      <SettingContent
        settings={ROOM_SETTINGS}
        values={selectedValues}
        isHost={isHost || false}
        onSettingChange={handleSettingChange}
      />
    </section>
  );
});

export { Setting };
