import { memo } from 'react';
import { PlayerStatus } from '@troublepainter/core';
import { PlayerCard } from '@/components/ui/player-card/PlayerCard';
import { usePlayers } from '@/hooks/game/usePlayers';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

const PlayerCardList = memo(() => {
  // roomSettings 제외하고 필요한 것만 구독
  const hostId = useGameSocketStore((state) => state.room?.hostId);
  const players = useGameSocketStore((state) => state.players);
  const playerId = useGameSocketStore((state) => state.currentPlayerId);
  const { getDisplayRoleText } = usePlayers();

  if (!players?.length) return null;

  return (
    <>
      {players.map((player) => {
        const playerRole = getDisplayRoleText(player.role) || null;

        return (
          <PlayerCard
            profileImage={player.profileImage}
            key={player.playerId}
            nickname={player.nickname}
            status={player.status}
            role={playerRole}
            score={player.score}
            isHost={player.status === PlayerStatus.NOT_PLAYING && player.playerId === hostId} // 이 플레이어가 방장인지
            isMe={player.playerId === playerId}
          />
        );
      })}
    </>
  );
});

export { PlayerCardList };
