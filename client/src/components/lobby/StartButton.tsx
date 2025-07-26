import { Button } from '@/components/ui/Button';
import { useGameStart } from '@/hooks/game/useGameStart';
import { useShortcuts } from '@/hooks/useShortcuts';
import { cn } from '@/utils/cn';

export const StartButton = () => {
  const { startGame, checkCanStart, getStartButtonStatus, isStarting } = useGameStart();
  const { disabled, title, content } = getStartButtonStatus();

  useShortcuts([
    {
      key: 'GAME_START',
      action: () => startGame(),
    },
  ]);

  return (
    <Button
      onClick={startGame}
      disabled={disabled || isStarting}
      title={title}
      className={cn(
        'h-full rounded-none border-0 text-xl',
        'sm:rounded-2xl sm:border-2 lg:text-2xl',
        !checkCanStart() && 'cursor-not-allowed opacity-50 hover:bg-violet-500',
      )}
    >
      {isStarting ? '곧 게임이 시작됩니다!' : content}
    </Button>
  );
};
