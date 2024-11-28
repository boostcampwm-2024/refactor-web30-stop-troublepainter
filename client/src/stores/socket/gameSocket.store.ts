import { Player, PlayerRole, PlayerStatus, Room, RoomSettings, RoomStatus, TimerType } from '@troublepainter/core';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GameState {
  room: Room | null;
  roomSettings: RoomSettings | null;
  players: Player[];
  roundWinners: Player[] | null;
  roundAssignedRole: PlayerRole | null;
  currentPlayerId: string | null;
  isHost: boolean | null;
  timers: Record<TimerType, number | null>;
}

interface GameActions {
  // 상태 업데이트 액션

  // room 상태 업데이트
  updateRoom: (room: Room) => void;
  updateCurrentRound: (currentRound: number) => void;
  updateCurrentWord: (currentWord: string) => void;
  updateRoomStatus: (status: RoomStatus) => void;

  // roomSetting 상태 업데이트
  updateRoomSettings: (settings: RoomSettings) => void;

  // player 상태 업데이트
  updatePlayers: (players: Player[]) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerRole: (playerId: string, role: PlayerRole) => void;
  updatePlayersStatus: (status: PlayerStatus) => void;

  // 나의 상태 업데이트
  updateCurrentPlayerId: (currentPlayerId: string) => void;
  updateIsHost: (isHost: boolean) => void;
  updateRoundAssignedRole: (role: PlayerRole) => void;

  // timer 상태 업데이트
  updateTimer: (timerType: TimerType, time: number) => void;
  decreaseTimer: (timerType: TimerType) => void;

  // 승자 상태 업데이트
  updateRoundWinners: (players: Player[]) => void;

  // 상태 초기화
  resetRound: () => void;
  resetGame: () => void;
  reset: () => void;
}

const initialState: GameState = {
  room: null,
  roomSettings: null,
  players: [],
  currentPlayerId: null,
  isHost: null,
  timers: { DRAWING: null, ENDING: null, GUESSING: null },
  roundWinners: null,
  roundAssignedRole: null,
};

const resetCommonState = () => ({
  roundWinners: null,
  roundAssignedRole: null,
  timers: { DRAWING: null, ENDING: null, GUESSING: null },
});

/**
 * 게임 상태를 관리하는 Store입니다.
 *
 * @remarks
 * 게임의 전역 상태(방, 플레이어, 설정 등)를 저장하고
 * 소켓 이벤트에 따라 상태를 업데이트합니다.
 *
 * @example
 * ```typescript
 * const GameComponent = () => {
 *   const { room, players, actions } = useGameSocketStore();
 *
 *   if (!room) return <div>로딩중...</div>;
 *
 *   return (
 *     <div>
 *       <h1>방 {room.roomId}</h1>
 *       <PlayerList players={players} />
 *     </div>
 *   );
 * };
 * ```
 *
 * @category Store
 */
export const useGameSocketStore = create<GameState & { actions: GameActions }>()(
  devtools(
    (set) => ({
      ...initialState,

      actions: {
        // 상태 업데이트 액션
        updateRoom: (room) => {
          set({ room });
        },

        updateCurrentRound: (currentRound) => {
          set((state) => ({
            room: state.room && { ...state.room, currentRound },
          }));
        },

        updateCurrentWord: (currentWord) => {
          set((state) => ({
            room: state.room && { ...state.room, currentWord },
          }));
        },

        updateRoomStatus: (status) => {
          set((state) => ({ room: state.room && { ...state.room, status } }));
        },

        updateRoomSettings: (settings) => {
          set({ roomSettings: settings });
        },

        updatePlayers: (players) => {
          set({ players });
        },

        updatePlayersStatus: (status) => {
          set((state) => ({ players: state.players.map((player) => ({ ...player, status })) }));
        },

        updateCurrentPlayerId: (currentPlayerId) => {
          set({ currentPlayerId });
        },

        removePlayer: (playerId) => {
          set((state) => ({
            players: state.players.filter((player) => player.playerId !== playerId),
          }));
        },

        updatePlayerRole: (playerId, role) => {
          set((state) => ({
            players: state.players.map((player) => (player.playerId === playerId ? { ...player, role } : player)),
          }));
        },

        updateIsHost: (isHost) => {
          set({ isHost });
        },

        updateRoundAssignedRole: (playerRole) => {
          set({ roundAssignedRole: playerRole });
        },

        updateTimer: (timerType, time) => {
          set((state) => ({
            timers: {
              ...state.timers,
              [timerType]: time,
            },
          }));
        },

        decreaseTimer: (timerType) => {
          set((state) => ({
            timers: {
              ...state.timers,
              [timerType]: Math.max(0, (state.timers?.[timerType] ?? 0) - 1),
            },
          }));
        },

        updateRoundWinners: (players) => {
          set({ roundWinners: players });
        },

        // 상태 초기화
        reset: () => {
          set(initialState);
        },

        // 라운드 상태 초기화
        resetRound: () => {
          set((state) => ({
            ...state,
            ...resetCommonState(),
            room: state.room && { ...state.room, currentWord: '' },
            players: state.players.map((player) => ({ ...player, role: undefined })),
          }));
        },

        // 게임 상태 초기화
        resetGame: () => {
          set((state) => ({
            ...state,
            ...resetCommonState(),
            room: state.room && { ...state.room, currentWord: '', status: RoomStatus.WAITING, currentRound: 0 },
            players: state.players.map((player) => ({
              ...player,
              role: undefined,
              score: 0,
              status: PlayerStatus.NOT_PLAYING,
            })),
          }));
        },
      },
    }),
    { name: 'GameSocketStore' },
  ),
);
