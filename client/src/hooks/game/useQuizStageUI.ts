import { PlayerRole, RoomStatus } from '@troublepainter/core';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

/**
 * 퀴즈 게임의 단계별 UI 표시 여부 및 텍스트를 관리하는 커스텀 훅입니다.
 *
 * @remarks
 * - 현재 라운드 상태(`roomStatus`)와 플레이어 역할(`roundAssignedRole`)에 따라
 *   캔버스, 퀴즈 제목, 타이머 등의 UI 표시 여부를 결정합니다.
 * - `currentWord`에 기반해 퀴즈 제목 텍스트를 동적으로 생성합니다.
 *
 * @returns
 * - `checkShowCanvasAndQuizTitle`: 캔버스와 퀴즈 단어를 보여줄지 여부를 반환하는 함수
 * - `checkShowBigTimer`: 큰 타이머를 보여줄지 여부를 반환하는 함수
 * - `getQuizTitleText`: 퀴즈 제목에 표시할 텍스트를 반환하는 함수
 * - `checkCanCanvasDraw`: 현재 캔버스에 그림을 그릴 수 있는지 여부를 반환하는 함수
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { useQuizStageUI } from './useQuizStageUI';
 *
 * const QuizStage = () => {
 *   const {
 *     checkShowCanvasAndQuizTitle,
 *     checkShowBigTimer,
 *     getQuizTitleText,
 *     checkCanCanvasDraw,
 *   } = useQuizStageUI();
 *
 *   return (
 *     <div>
 *       {checkShowCanvasAndQuizTitle() && <Canvas />}
 *       <h1>{getQuizTitleText()}</h1>
 *       {checkShowBigTimer() && <BigTimer />}
 *       {checkCanCanvasDraw() && <DrawingTools />}
 *     </div>
 *   );
 * };
 * ```
 */

export const useQuizStageUI = () => {
  const roundAssignedRole = useGameSocketStore((state) => state.roundAssignedRole);
  const roomStatus = useGameSocketStore((state) => state.room?.status);
  const currentWord = useGameSocketStore((state) => state.room?.currentWord);

  const checkShowCanvasAndQuizTitle = () => {
    if (roomStatus === RoomStatus.GUESSING || roomStatus === RoomStatus.POST_ROUND) return true;
    if (roomStatus === RoomStatus.DRAWING && roundAssignedRole !== PlayerRole.GUESSER) return true;
    return false;
  };

  const checkShowBigTimer = () => {
    if (roomStatus === RoomStatus.DRAWING && roundAssignedRole === PlayerRole.GUESSER) return true;
    return false;
  };

  const getQuizTitleText = () => {
    if (roomStatus === RoomStatus.DRAWING) {
      return roundAssignedRole !== PlayerRole.GUESSER ? `${currentWord}` : '';
    }
    if (roomStatus === RoomStatus.GUESSING || roomStatus === RoomStatus.POST_ROUND) {
      return roundAssignedRole !== PlayerRole.GUESSER ? `${currentWord} (맞히는중...)` : '맞혀보세요-!';
    }
  };

  const checkCanCanvasDraw = () => {
    if (roomStatus === RoomStatus.DRAWING && roundAssignedRole !== PlayerRole.GUESSER) return true;
    return false;
  };

  return {
    checkShowCanvasAndQuizTitle,
    checkShowBigTimer,
    getQuizTitleText,
    checkCanCanvasDraw,
  };
};
