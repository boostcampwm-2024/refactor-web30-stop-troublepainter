import { HTMLAttributes, memo } from 'react';
import { RoomSettings } from '@troublepainter/core';
import { SettingContent } from '@/components/room-setting/SettingContent';
import { WordsThemeModalContent } from '@/components/room-setting/WordsThemeModalContent';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SHORTCUT_KEYS } from '@/constants/shortcutKeys';
import { useGameSetting } from '@/hooks/game/useGameSetting';
import { useModal } from '@/hooks/useModal';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { cn } from '@/utils/cn';

type SettingKey = keyof RoomSettings;

export interface RoomSettingItem {
  key: SettingKey;
  label: string;
  options: number[];
  shortcutKey: keyof typeof SHORTCUT_KEYS;
}

export const ROOM_SETTINGS: RoomSettingItem[] = [
  { label: '라운드 수', key: 'totalRounds', options: [3, 5, 7, 9, 11], shortcutKey: 'DROPDOWN_TOTAL_ROUNDS' },
  { label: '최대 플레이어 수', key: 'maxPlayers', options: [4, 5], shortcutKey: 'DROPDOWN_MAX_PLAYERS' },
  { label: '제한 시간', key: 'drawTime', options: [15, 20, 25, 30], shortcutKey: 'DROPDOWN_DRAW_TIME' },
  //{ label: '픽셀 수', key: 'maxPixels', options: [300, 500] },
];

const Setting = memo(({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const settingTool = useGameSetting();
  const { checkCanSettingEdit, updateSetting, selectedValues } = settingTool;

  const roomSettings = useGameSocketStore((state) => state.roomSettings);

  // 모달
  const { isModalOpened, openModal, closeModal, handleKeyDown } = useModal();

  return (
    <section
      className={cn('flex w-full flex-col border-0 border-violet-950 sm:rounded-xl sm:border-2', className)}
      {...props}
    >
      {/* Setting title */}
      <div className="flex h-14 w-full items-center justify-between border-0 border-violet-950 bg-violet-500 px-4 sm:h-16 sm:rounded-t-[0.625rem] sm:border-b-2">
        <h2 className="text-2xl text-white text-stroke-md sm:translate-y-1 lg:text-3xl">
          {roomSettings?.wordsTheme || 'Setting'}
        </h2>
        {checkCanSettingEdit() && (
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
        <WordsThemeModalContent closeModal={closeModal} settingTool={settingTool} />
      </Modal>
      <SettingContent
        settings={ROOM_SETTINGS}
        values={selectedValues}
        canEdit={checkCanSettingEdit() || false}
        onSettingChange={updateSetting}
      />
    </section>
  );
});

export { Setting };
