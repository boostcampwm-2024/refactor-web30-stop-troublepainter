import { useEffect, useState } from 'react';
import { PlayerRole, RoomStatus } from '@troublepainter/core';
import gameLoss from '@/assets/sounds/game-loss.mp3';
import gameWin from '@/assets/sounds/game-win.mp3';
import { useModal } from '@/hooks/useModal';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { useTimerStore } from '@/stores/timer.store';
import { SOUND_IDS, SoundManager } from '@/utils/soundManager';

/**
 * 라운드 종료 모달과 관련 애니메이션, 사운드를 관리하는 커스텀 훅입니다.
 *
 * @remarks
 * - 라운드 종료(`POST_ROUND`) 시 모달을 자동으로 열고, 승패에 따른 사운드를 재생합니다.
 * - 라운드 진행 중(`DRAWING`)에는 모달을 닫습니다.
 * - 애니메이션 효과를 3초간 보여주고, 이후 페이드아웃 처리 및 상태 초기화를 수행합니다.
 * - `SoundManager`를 통해 승리 및 패배 사운드를 미리 로드 및 재생합니다.
 * - 게임 내 플레이어, 승자, 역할 등의 상태를 함께 제공합니다.
 *
 * @returns
 * - `isModalOpened`: 모달 열림 상태 (boolean)
 * - `isAnimationFading`: 애니메이션 페이드아웃 상태 (boolean)
 * - `isDevilWin`: 악마(DEVIL) 역할이 승리했는지 여부 (boolean)
 * - `isPlayerWinner`: 현재 플레이어가 라운드 승자인지 여부 (boolean)
 * - `devil`: 악마 역할을 가진 플레이어 객체 (없을 수 있음)
 * - `showAnimation`: 애니메이션을 보여줄지 여부 (boolean)
 * - `solver`: 문제를 맞힌 플레이어(추측자) 객체 (없을 수 있음)
 * - `timer`: 라운드 종료 타이머 상태 (숫자, 초 단위)
 *
 * @example
 * ```tsx
 * const RoundEndModal = () => {
 *   const {
 *     isModalOpened,
 *     isAnimationFading,
 *     isDevilWin,
 *     isPlayerWinner,
 *     devil,
 *     showAnimation,
 *     solver,
 *     timer,
 *   } = useRoundEndModal();
 *
 *   if (!isModalOpened) return null;
 *
 *   return (
 *     <div className={`modal ${isAnimationFading ? 'fade-out' : ''}`}>
 *       {showAnimation && <div className="animation">라운드 종료 애니메이션</div>}
 *       <h2>{isDevilWin ? '악마가 이겼습니다!' : '추측자가 이겼습니다!'}</h2>
 *       <p>악마: {devil?.name}</p>
 *       <p>승자: {isPlayerWinner ? '당신' : solver?.name}</p>
 *       <p>다음 라운드까지: {timer}초</p>
 *     </div>
 *   );
 * };
 * ```
 */

export const useRoundEndModal = () => {
  const players = useGameSocketStore((state) => state.players);
  const roundWinners = useGameSocketStore((state) => state.roundWinners);
  const playerId = useGameSocketStore((state) => state.currentPlayerId);
  const roomStatus = useGameSocketStore((state) => state.room?.status);
  const timer = useTimerStore((state) => state.timers.ENDING);

  const { isModalOpened, openModal, closeModal } = useModal();

  const [showAnimation, setShowAnimation] = useState(false);
  const [isAnimationFading, setIsAnimationFading] = useState(false);

  const devil = players.find((player) => player.role === PlayerRole.DEVIL);
  const isDevilWin = roundWinners?.some((winner) => winner.role === PlayerRole.DEVIL);
  const isPlayerWinner = roundWinners?.some((winner) => winner.playerId === playerId);
  const solver = roundWinners?.find((winner) => winner.role === PlayerRole.GUESSER);

  // 컴포넌트 마운트 시 사운드 미리 로드
  const soundManager = SoundManager.getInstance();
  useEffect(() => {
    soundManager.preloadSound(SOUND_IDS.WIN, gameWin);
    soundManager.preloadSound(SOUND_IDS.LOSS, gameLoss);
  }, [soundManager]);

  useEffect(() => {
    if (roomStatus === RoomStatus.POST_ROUND) {
      setIsAnimationFading(false);
      setShowAnimation(true);
      openModal();

      if (isPlayerWinner) {
        void soundManager.playSound(SOUND_IDS.WIN, 0.3);
      } else {
        void soundManager.playSound(SOUND_IDS.LOSS, 0.3);
      }
    }
  }, [roomStatus]);

  useEffect(() => {
    if (roomStatus === RoomStatus.DRAWING) closeModal();
  }, [roomStatus]);

  useEffect(() => {
    if (showAnimation) {
      // 3초 후에 페이드아웃 시작
      const fadeTimer = setTimeout(() => {
        setIsAnimationFading(true);
      }, 3000);

      // 3.5초 후에 컴포넌트 제거
      const removeTimer = setTimeout(() => {
        setShowAnimation(false);
      }, 3500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showAnimation]);

  return {
    isModalOpened,
    isAnimationFading,
    isDevilWin,
    isPlayerWinner,
    devil,
    showAnimation,
    solver,
    timer,
  };
};
