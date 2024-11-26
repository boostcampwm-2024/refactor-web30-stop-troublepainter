import { PlayerRole } from '@troublepainter/core';
import { PlayerCard } from '@/components/ui/player-card/PlayerCard';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

const PlayerCardList = () => {
  const { players, currentPlayerId, room } = useGameSocketStore();

  if (!players?.length) return null;

  const myRole = players.find((player) => player.playerId === currentPlayerId)?.role || undefined;

  const getPlayerRole = (playerRole: PlayerRole | undefined, myRole: PlayerRole | undefined) => {
    if (myRole === PlayerRole.GUESSER) return playerRole === PlayerRole.GUESSER ? playerRole : null;
    return playerRole;
  };

  return (
    <>
      {players.map((player) => {
        const playerRole = getPlayerRole(player.role, myRole) || null;

        return (
          <PlayerCard
            key={player.playerId}
            nickname={player.nickname}
            status={player.status}
            role={playerRole}
            score={player.score}
            isHost={player.playerId === room?.hostId} // 이 플레이어가 방장인지
            isMe={player.playerId === currentPlayerId}
          />
        );
      })}
    </>
  );
};

export { PlayerCardList };
