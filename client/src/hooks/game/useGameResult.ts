import { useEffect } from 'react';
import { RoomStatus, TerminationType } from '@troublepainter/core';
import { useNavigate } from 'react-router-dom';
import { useTimeout } from '../useTimeout';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { useToastStore } from '@/stores/toast.store';

/**
 * 게임 종료 후 결과 처리와 관련된 로직을 담당하는 커스텀 훅입니다.
 *
 * @remarks
 * 이 훅은 모든 라운드가 종료되어 방 상태가 `POST_END`가 되었을 때 다음과 같은 작업을 수행합니다:
 *
 * - 플레이어들의 점수를 기준으로 1등, 2등, 3등 플레이어 목록을 계산합니다.
 * - 게임 종료 사유에 따라 토스트 메시지를 표시합니다.
 * - 20초 후 자동으로 대기실(`/lobby/:roomId`)로 이동하며, 게임 상태를 초기화합니다.
 *
 *
 * @returns 게임 종료 후 결과 처리와 관련된 함수를 포함하는 객체:
 * - `getRankedPlayers`: 각 등수별 플레이어 목록을 가져옵니다.
 *
 * @example
 * ```tsx
 * const { getRankedPlayers } = useGameResult();
 * const { firstPlacePlayers, secondPlacePlayers, thirdPlacePlayers } = getRankedPlayers();
 *
 * return (
 *   <div>
 *     <h2>1등</h2>
 *     {firstPlacePlayers.map(p => <PlayerCard key={p.id} player={p} />)}
 *
 *     <h3>2등</h3>
 *     {secondPlacePlayers.map(p => <PlayerCard key={p.id} player={p} />)}
 *
 *     <h4>3등</h4>
 *     {thirdPlacePlayers.map(p => <PlayerCard key={p.id} player={p} />)}
 *   </div>
 * );
 * ```
 */

export const useGameResult = () => {
  const navigate = useNavigate();
  const roomId = useGameSocketStore((state) => state.room?.roomId);
  const terminateType = useGameSocketStore((state) => state.gameTerminateType);
  const gameActions = useGameSocketStore((state) => state.actions);
  const toastActions = useToastStore((state) => state.actions);
  const roomStatus = useGameSocketStore((state) => state.room?.status);
  const players = useGameSocketStore((state) => state.players);

  const getRankedPlayers = () => {
    const validPlayers = players.filter((player) => player.score > 0);
    const sortedScores = [...new Set(validPlayers.map((p) => p.score))].sort((a, b) => b - a);
    const rankedPlayers = sortedScores
      .slice(0, 3)
      .map((score) => validPlayers.filter((player) => player.score === score));

    return {
      firstPlacePlayers: rankedPlayers[0] ?? [],
      secondPlacePlayers: rankedPlayers[1] ?? [],
      thirdPlacePlayers: rankedPlayers[2] ?? [],
    };
  };

  useEffect(() => {
    if (roomStatus !== RoomStatus.POST_END) return;
    const description =
      terminateType === TerminationType.PLAYER_DISCONNECT
        ? '나간 플레이어가 있어요. 20초 후 대기실로 이동합니다!'
        : '20초 후 대기실로 이동합니다!';
    const variant = terminateType === TerminationType.PLAYER_DISCONNECT ? 'warning' : 'success';

    toastActions.addToast({
      title: '게임 종료',
      description,
      variant,
      duration: 20000,
    });
  }, [roomStatus]);

  const handleTimeout = () => {
    if (roomStatus !== RoomStatus.POST_END) return;
    gameActions.resetGame();
    navigate(`/lobby/${roomId}`);
  };

  useTimeout(handleTimeout, 20000);

  return {
    getRankedPlayers,
  };
};
