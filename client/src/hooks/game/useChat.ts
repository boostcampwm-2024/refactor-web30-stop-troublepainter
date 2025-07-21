import { ChangeEvent, FormEvent, useState } from 'react';
import { ChatRequest, PlayerRole, RoomStatus } from '@troublepainter/core';
import { chatSocketHandlers } from '@/handlers/socket/chatSocket.handler';
import { gameSocketHandlers } from '@/handlers/socket/gameSocket.handler';
import { useChatSocketStore } from '@/stores/socket/chatSocket.store';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { useSocketStore } from '@/stores/socket/socket.store';

/**
 * useChat 훅은 채팅 기능에 필요한 상태 및 동작을 제공하는 커스텀 훅입니다.
 *
 * 이 훅은 채팅 입력값 상태를 관리하고, 채팅 메시지를 전송하며,
 * 입력 필드의 활성화 여부를 판단합니다.
 *
 * @remarks
 * - `RoomStatus.DRAWING` 또는 `RoomStatus.GUESSING` 상태일 때 GUESSER 역할이 아니라면 채팅 입력이 비활성화됩니다.
 * - 채팅 메시지를 전송하면 `chatSocketHandlers.sendMessage`를 통해 서버로 전송되고,
 *   로컬 상태에는 `chatActions.addMessage`를 통해 즉시 반영됩니다.
 * - 게임 상태가 `GUESSING`일 경우, `gameSocketHandlers.checkAnswer`를 통해 정답 여부를 체크합니다.
 *
 * @returns 채팅 기능에 필요한 상태 및 동작을 포함하는 객체:
 * - `submitMessage`: 폼 제출 시 메시지를 전송합니다.
 * - `changeMessage`: 인풋 값이 변경될 때 상태를 업데이트합니다.
 * - `checkDisableInput`: 인풋 필드가 비활성화되어야 하는지 여부를 반환합니다.
 * - `inputMessage`: 현재 입력된 메시지 문자열입니다.
 *
 * @example
 * ```tsx
 *   const { submitMessage, checkDisableInput, changeMessage, inputMessage } = useChat();
 *
 *   return (
 *     <form onSubmit={submitMessage}>
 *       <Input
 *         value={inputMessage}
 *         onChange={changeMessage}
 *         disabled={checkDisableInput()}
 *       />
 *     </form>
 * );
 * ```
 */

export const useChat = () => {
  // 개별 Selector
  const isConnected = useSocketStore((state) => state.connected.chat);
  const currentPlayerId = useGameSocketStore((state) => state.currentPlayerId);
  const players = useGameSocketStore((state) => state.players);
  const roomStatus = useGameSocketStore((state) => state.room?.status);
  const roundAssignedRole = useGameSocketStore((state) => state.roundAssignedRole);
  const chatActions = useChatSocketStore((state) => state.actions);

  const [inputMessage, setInputMessage] = useState('');

  const submitMessage = (e: FormEvent) => {
    e.preventDefault();
    sendChat(inputMessage.trim());
    setInputMessage('');
  };

  const changeMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const checkDisableInput = () => {
    if (roomStatus !== RoomStatus.DRAWING && roomStatus !== RoomStatus.GUESSING) return false;
    if (roundAssignedRole === PlayerRole.GUESSER) return false;
    return true;
  };

  const sendChat = (message: string) => {
    if (!isConnected || !message.trim()) return;
    void chatSocketHandlers.sendMessage(message);

    const currentPlayer = players?.find((player) => player.playerId === currentPlayerId);
    if (!currentPlayer || !currentPlayerId) throw new Error('Current player not found');

    const messageData: ChatRequest = {
      playerId: String(currentPlayerId),
      nickname: currentPlayer.nickname,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    chatActions.addMessage(messageData);

    if (roomStatus === RoomStatus.GUESSING) {
      void gameSocketHandlers.checkAnswer({ answer: message });
    }
  };

  return { submitMessage, changeMessage, checkDisableInput, inputMessage };
};
