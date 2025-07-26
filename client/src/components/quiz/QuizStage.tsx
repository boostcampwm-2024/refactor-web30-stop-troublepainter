import { PlayerRole } from '@troublepainter/core';
import { GameCanvas } from '../canvas/GameCanvas';
import { QuizTitle } from '../ui/QuizTitle';
import sizzlingTimer from '@/assets/big-timer.gif';
import { DEFAULT_MAX_PIXELS } from '@/constants/canvasConstants';
import { useQuizStageUI } from '@/hooks/game/useQuizStageUI';
import { useTimer } from '@/hooks/game/useTimer';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

const QuizStageContainer = () => {
  const { checkShowBigTimer, checkShowCanvasAndQuizTitle, getQuizTitleText, checkCanCanvasDraw } = useQuizStageUI();
  const { getRemainingTime } = useTimer();
  const roomSettings = useGameSocketStore((state) => state.roomSettings);
  const room = useGameSocketStore((state) => state.room);
  const roundAssignedRole = useGameSocketStore((state) => state.roundAssignedRole);

  return (
    <>
      {/* 구경꾼 전용 타이머 */}
      {checkShowBigTimer() && (
        <div>
          <p className="mb-3 text-center text-xl text-eastbay-50 text-stroke-md sm:mb-0 sm:text-2xl lg:text-3xl">
            화가들이 실력을 뽐내는중...
          </p>
          <div className="relative">
            <img src={sizzlingTimer} alt="구경꾼 전용 타이머" width={450} />
            <span className="absolute left-[42%] top-[45%] text-6xl text-stroke-md lg:text-7xl">
              {getRemainingTime() ?? 0}
            </span>
          </div>
        </div>
      )}

      <div className={!checkShowCanvasAndQuizTitle() ? 'hidden' : 'contents'}>
        <QuizTitle
          currentRound={room?.currentRound || 0}
          totalRound={roomSettings?.totalRounds || 0}
          title={getQuizTitleText() || ''}
          remainingTime={getRemainingTime() || 0}
        />

        <GameCanvas
          currentRound={room?.currentRound || 0}
          isDrawable={checkCanCanvasDraw()}
          role={roundAssignedRole || PlayerRole.GUESSER}
          maxPixels={DEFAULT_MAX_PIXELS}
        />
      </div>
    </>
  );
};

export default QuizStageContainer;
