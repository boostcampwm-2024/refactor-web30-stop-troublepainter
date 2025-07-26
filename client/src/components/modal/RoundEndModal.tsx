import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import roundLoss from '@/assets/lottie/round-loss.lottie';
import roundWin from '@/assets/lottie/round-win.lottie';
import { Modal } from '@/components/ui/Modal';
import { useRoundEndModal } from '@/hooks/game/useRoundEndModal';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { cn } from '@/utils/cn';

const RoundEndModal = () => {
  const { showAnimation, isPlayerWinner, isAnimationFading, isModalOpened, timer, isDevilWin, solver, devil } =
    useRoundEndModal();
  const currentWord = useGameSocketStore((state) => state.room?.currentWord);

  return (
    <>
      {/* 승리/패배 애니메이션 */}
      {showAnimation &&
        (isPlayerWinner ? (
          <DotLottieReact
            src={roundWin}
            autoplay
            loop={false}
            className={cn(
              'absolute left-1/2 top-1/2 z-[999] h-screen w-full -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500',
              isAnimationFading && 'opacity-0',
            )}
          />
        ) : (
          <DotLottieReact
            src={roundLoss}
            autoplay
            loop
            className={cn(
              'absolute left-1/2 top-[60%] z-[999] h-[50vh] w-full -translate-x-1/2 -translate-y-1/2 opacity-70 transition-opacity duration-500',
              isAnimationFading && 'opacity-0',
            )}
          />
        ))}

      <Modal title={currentWord || ''} isModalOpened={isModalOpened} className="max-w-[26.875rem] sm:max-w-[61.75rem]">
        <div className="relative flex min-h-[12rem] items-center justify-center sm:min-h-[15.75rem]">
          <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-violet-300 text-base text-violet-300">
            {timer}
          </span>
          <p className="text-center text-2xl sm:m-2 sm:text-3xl">
            {isDevilWin ? (
              <> 정답을 맞춘 구경꾼이 없습니다</>
            ) : (
              <>
                구경꾼 <span className="text-violet-600">{solver?.nickname}</span>
                이(가) 정답을 맞혔습니다
              </>
            )}
          </p>
        </div>
        <div className="min-h-[4rem] rounded-md bg-violet-50 p-4 sm:m-2">
          <p className="text-center text-xl text-violet-950 sm:text-2xl">
            방해꾼은 <span className="text-violet-600">{devil?.nickname}</span>였습니다.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default RoundEndModal;
