import { PlayerRole } from '@troublepainter/core';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

/**
 * 플레이어 관련 상태 및 역할 표시 로직을 제공하는 커스텀 훅입니다.
 *
 * @remarks
 * - 현재 사용자의 역할(`roundAssignedRole`)에 따라 상대 플레이어의 역할 표시를 제한합니다.
 * - 사용자가 `GUESSER` 역할일 경우, 상대방이 `GUESSER`일 때만 역할을 표시하고, 그렇지 않으면 `null`을 반환합니다.
 * - 사용자가 `GUESSER`가 아닐 경우에는 상대 플레이어 역할을 그대로 반환합니다.
 *
 * @returns
 * - `getDisplayRoleText`: 플레이어 역할을 받아서 화면에 표시할 역할 텍스트를 반환하는 함수
 *
 * @example
 * ```tsx
 * const PlayerRoleDisplay = ({ role }: { role: PlayerRole | undefined }) => {
 *   const { getDisplayRoleText } = usePlayers();
 *   const displayRole = getDisplayRoleText(role);
 *
 *   return <span>{displayRole ?? '비공개'}</span>;
 * };
 * ```
 */

export const usePlayers = () => {
  const myRole = useGameSocketStore((state) => state.roundAssignedRole);

  const getDisplayRoleText = (playerRole: PlayerRole | undefined) => {
    if (myRole === PlayerRole.GUESSER) return playerRole === PlayerRole.GUESSER ? playerRole : null;
    return playerRole;
  };

  return {
    getDisplayRoleText,
  };
};
