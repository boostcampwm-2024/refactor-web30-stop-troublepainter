import { useEffect } from 'react';
import {
  PlayerRole,
  type JoinRoomResponse,
  type PlayerLeftResponse,
  type RoundStartResponse,
  type UpdateSettingsResponse,
  type TimerSyncResponse,
  RoundEndResponse,
  RoomStatus,
  TimerType,
  PlayerStatus,
  RoomEndResponse,
  TerminationType,
  Cheating,
} from '@troublepainter/core';
import { DrawingCheckedResponse } from '@troublepainter/core';
import { useNavigate, useParams } from 'react-router-dom';
import entrySound from '@/assets/sounds/entry-sound-effect.mp3';
import { gameSocketHandlers } from '@/handlers/socket/gameSocket.handler';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { SocketNamespace } from '@/stores/socket/socket.config';
import { useSocketStore } from '@/stores/socket/socket.store';
import { useTimerStore } from '@/stores/timer.store';
import { useToastStore } from '@/stores/toast.store';
import { checkTimerDifference } from '@/utils/checkTimerDifference';
import { playerIdStorageUtils } from '@/utils/playerIdStorage';
import { SOUND_IDS, SoundManager } from '@/utils/soundManager';

/**
 * 게임 진행에 필요한 소켓 연결과 상태를 관리하는 Hook입니다.
 *
 * @remarks
 * - store 중심적 구조
 * - 자동 연결/재연결 처리
 * - 플레이어 식별자 영속성 관리
 * - 게임의 전반적인 상태 관리 (room, players, settings 등)
 * - 여러 게임 상태 이벤트 포괄적인 핸들링
 *
 * @example
 * ```typescript
 * // GameLayout.tsx에서의 사용 예시
 * const GameLayout = () => {
 *  // 게임 소켓 연결
 *  useGameSocket();
 *  // 소켓 연결 확인 상태
 *  const isConnected = useSocketStore((state) => state.connected.game);
 *
 *  // 연결 상태에 따른 로딩 표시
 *  if (!isConnected) {
 *    return (
 *      <div className="flex h-screen w-full items-center justify-center">
 *        <DotLottieReact src={loading} loop autoplay className="h-96 w-96" />
 *      </div>
 *    );
 *  }
 *
 *
 *   return (
 *     <div>
 *       <header />
 *       <Outlet />
 *     </div>
 *   );
 * };
 * ```
 *
 * @returns 게임 소켓 상태와 액션 메소드들
 * - `socket` - 현재 게임 소켓 인스턴스
 * - `isConnected` - 연결 상태
 * - `actions` - 게임 상태 관리 메소드들
 *
 * @throws 소켓 연결 실패 시 에러
 * @category Hooks
 */
export const useGameSocket = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { sockets, actions: socketActions } = useSocketStore();
  const gameActions = useGameSocketStore((state) => state.actions);
  const timerActions = useTimerStore((state) => state.actions);
  const toastActions = useToastStore((state) => state.actions);
  const navigate = useNavigate();

  // 연결 + 재연결 시도
  useEffect(() => {
    // roomId가 없으면 연결하지 않음
    if (!roomId) return;

    // 소켓 연결
    socketActions.connect(SocketNamespace.GAME);

    // 현재 방의 연결 정보 처리
    const savedPlayerId = playerIdStorageUtils.getPlayerId(roomId);
    // console.log(savedPlayerId, roomId);
    if (savedPlayerId) {
      gameSocketHandlers.reconnect({ playerId: savedPlayerId, roomId }).catch((error) => {
        // 재연결 실패 시 계정 삭제
        console.error('Reconnection failed:', error);
        playerIdStorageUtils.removePlayerId(roomId);
      });
    }
    // savedPlayerId가 없다면 새로운 접속 시도
    else {
      playerIdStorageUtils.removeAllPlayerIds();
      gameSocketHandlers.joinRoom({ roomId }).catch(console.error);
    }

    // 연결 해제 시 현재 방의 playerId만 제거
    return () => {
      socketActions.disconnect(SocketNamespace.GAME);
      playerIdStorageUtils.removePlayerId(roomId);
    };
  }, [roomId]);

  // 컴포넌트 마운트 시 사운드 미리 로드
  useEffect(() => {
    const soundManager = SoundManager.getInstance();
    soundManager.preloadSound(SOUND_IDS.ENTRY, entrySound);
  }, []);

  useEffect(() => {
    const socket = sockets.game;
    if (!socket || !roomId) return;

    const soundManager = SoundManager.getInstance();

    const handlers = {
      joinedRoom: (response: JoinRoomResponse) => {
        const { room, roomSettings, players, playerId } = response;
        gameActions.updateRoom(room);
        gameActions.updateRoomSettings({ ...roomSettings, drawTime: roomSettings.drawTime - 5 });
        gameActions.updatePlayers(players);
        if (playerId) {
          playerIdStorageUtils.setPlayerId(roomId, playerId);
          gameActions.updateCurrentPlayerId(playerId);
          gameActions.updateIsHost(room.hostId === playerId);
          void soundManager.playSound(SOUND_IDS.ENTRY, 0.5);
        }
      },

      playerJoined: (response: JoinRoomResponse) => {
        const { room, roomSettings, players } = response;
        gameActions.updateRoom(room);
        gameActions.updateRoomSettings({ ...roomSettings, drawTime: roomSettings.drawTime - 5 });
        gameActions.updatePlayers(players);
        void soundManager.playSound(SOUND_IDS.ENTRY, 0.5);
      },

      playerLeft: (response: PlayerLeftResponse) => {
        const { leftPlayerId, players, hostId } = response;
        gameActions.removePlayer(leftPlayerId);
        gameActions.updatePlayers(players);
        gameActions.updateHost(hostId);
        gameActions.updateIsHost(hostId === useGameSocketStore.getState().currentPlayerId);
      },

      settingsUpdated: (response: UpdateSettingsResponse) => {
        const { settings } = response;
        gameActions.updateRoomSettings({ ...settings, drawTime: settings.drawTime - 5 });
      },

      drawingGroupRoundStarted: (response: RoundStartResponse) => {
        gameActions.resetRound();
        const { roundNumber, roles, word, assignedRole, drawTime } = response;
        const { painters, devils, guessers } = roles;
        gameActions.updatePlayersStatus(PlayerStatus.PLAYING);
        gameActions.updateCurrentRound(roundNumber);
        gameActions.updateRoundAssignedRole(assignedRole);
        painters?.forEach((playerId) => gameActions.updatePlayerRole(playerId, PlayerRole.PAINTER));
        guessers?.forEach((playerId) => gameActions.updatePlayerRole(playerId, PlayerRole.GUESSER));
        devils?.forEach((playerId) => gameActions.updatePlayerRole(playerId, PlayerRole.DEVIL));
        if (word) gameActions.updateCurrentWord(word);
        timerActions.updateTimer(TimerType.DRAWING, drawTime);
        gameActions.updateRoomStatus(RoomStatus.DRAWING);
        navigate(`/game/${roomId}`, { replace: true }); // replace: true로 설정, 히스토리에서 대기방 제거
      },

      guesserRoundStarted: (response: RoundStartResponse) => {
        gameActions.resetRound();
        const { roundNumber, roles, assignedRole, drawTime } = response;
        const { guessers } = roles;
        gameActions.updatePlayersStatus(PlayerStatus.PLAYING);
        gameActions.updateCurrentRound(roundNumber);
        gameActions.updateRoundAssignedRole(assignedRole);
        guessers?.forEach((playerId) => gameActions.updatePlayerRole(playerId, PlayerRole.GUESSER));
        timerActions.updateTimer(TimerType.DRAWING, drawTime);
        gameActions.updateRoomStatus(RoomStatus.DRAWING);
        navigate(`/game/${roomId}`, { replace: true });
      },

      timerSync: (response: TimerSyncResponse) => {
        const { remaining, timerType } = response;
        const serverTimer = Math.ceil(remaining / 1000);
        const clientTimer = useTimerStore.getState().timers[timerType];
        if (clientTimer === null || checkTimerDifference(serverTimer, clientTimer, 1)) {
          timerActions.updateTimer(timerType, serverTimer);
        }
      },

      drawingTimeEnded: () => {
        gameActions.updateRoomStatus(RoomStatus.GUESSING);
        timerActions.updateTimer(TimerType.GUESSING, 15);
      },

      roundEnded: (response: RoundEndResponse) => {
        const { roundNumber, word, winners, players } = response;
        gameActions.updateCurrentRound(roundNumber);
        gameActions.updateCurrentWord(word);
        gameActions.updateRoundWinners(winners);
        timerActions.updateTimer(TimerType.ENDING, 10);
        gameActions.updatePlayers(players);
      },

      gameEnded: (response: RoomEndResponse) => {
        const { terminationType, leftPlayerId, hostId } = response;
        if (terminationType === TerminationType.PLAYER_DISCONNECT && leftPlayerId && hostId) {
          gameActions.removePlayer(leftPlayerId);
          gameActions.updateHost(hostId);
          gameActions.updateIsHost(hostId === useGameSocketStore.getState().currentPlayerId);
        }
        gameActions.updateRoomStatus(RoomStatus.WAITING);
        gameActions.resetRound();
        gameActions.updateGameTerminateType(terminationType);
        navigate(`/game/${roomId}/result`, { replace: true });
      },

      drawingChecked: (response: DrawingCheckedResponse) => {
        const { result } = response;
        const roomStatus = useGameSocketStore.getState().room?.status;

        if (result === 'OK' || roomStatus !== RoomStatus.DRAWING) return;

        const map: Partial<Record<Cheating, string>> = {
          INITIAL: '초성',
          FULL_ANSWER: '단어',
          LENGTH: '단어 길이',
        };

        const cheatType = map[result] ?? '알 수 없는';

        toastActions.addToast({
          title: `${cheatType} 부정행위!`,
          description: '누군가 그림 대신 글씨를 썼네요! 그림을 그려야죠 😊 글씨는 지워 주세요~',
          variant: 'warning',
        });
      },
    };

    // 이벤트 리스너 등록
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      // 이벤트 리스너 제거
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [sockets.game, roomId]);
};
