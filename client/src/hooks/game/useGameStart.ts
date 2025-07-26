import { useEffect, useState } from 'react';
import { RoomStatus } from '@troublepainter/core';
import { gameSocketHandlers } from '@/handlers/socket/gameSocket.handler';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

export const START_BUTTON_STATUS = {
  NOT_HOST: {
    title: '방장만 게임을 시작할 수 있습니다',
    content: '방장만 시작 가능',
    disabled: true,
  },
  NOT_ENOUGH_PLAYERS: {
    title: '게임을 시작하려면 최소 4명의 플레이어가 필요합니다',
    content: '4명 이상 게임 시작 가능',
    disabled: true,
  },
  CAN_START: {
    title: '',
    content: '게임 시작',
    disabled: false,
  },
} as const;

const MIN_PLAYER = 4;

/**
 * 게임 시작 버튼 상태를 관리하는 커스텀 훅입니다.
 *
 * @remarks
 * - 방장 여부, 플레이어 수, 방 상태에 따라 게임 시작 버튼 상태를 결정합니다.
 * - 게임 시작 요청 시 소켓 핸들러를 호출하고, 시작 상태를 관리합니다.
 * - 방 상태가 WAITING일 때는 시작 상태를 리셋합니다.
 *
 * @returns
 * - `isStarting`: 게임 시작 요청 중인지 여부 (boolean)
 * - `getStartButtonStatus`: 현재 게임 시작 버튼의 상태를 반환하는 함수
 * - `startGame`: 게임 시작을 요청하는 함수
 * - `checkCanStart`: 게임 시작이 가능한지 확인하는 함수 (현재는 방장 여부만 확인)
 *
 * @example
 * ```tsx
 * const StartGameButton = () => {
 *   const { isStarting, getStartButtonStatus, startGame, checkCanStart } = useGameStart();
 *   const status = getStartButtonStatus();
 *
 *   return (
 *     <button
 *       disabled={status.disabled || isStarting}
 *       title={status.title}
 *       onClick={() => {
 *         if (checkCanStart() && !isStarting) {
 *           startGame();
 *         }
 *       }}
 *     >
 *       {isStarting ? '게임 시작 중...' : status.content}
 *     </button>
 *   );
 * };
 * ```
 */

export const useGameStart = () => {
  const isHost = useGameSocketStore((state) => state.isHost);
  const players = useGameSocketStore((state) => state.players);
  const roomStatus = useGameSocketStore((state) => state.room?.status);

  const [isStarting, setIsStarting] = useState(false);

  const getStartButtonStatus = () => {
    if (!isHost) return START_BUTTON_STATUS.NOT_HOST;
    if (players.length < MIN_PLAYER) return START_BUTTON_STATUS.NOT_ENOUGH_PLAYERS;
    return START_BUTTON_STATUS.CAN_START;
  };

  const startGame = () => {
    void gameSocketHandlers.gameStart();
    setIsStarting(true);
  };

  const checkCanStart = () => isHost;

  useEffect(() => {
    if (roomStatus === RoomStatus.WAITING) {
      setIsStarting(false);
    }
  }, [roomStatus]);

  return {
    isStarting,
    getStartButtonStatus,
    startGame,
    checkCanStart,
  };
};
