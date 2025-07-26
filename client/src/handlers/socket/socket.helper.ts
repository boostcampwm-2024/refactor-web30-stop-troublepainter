import { SocketNamespace } from '@/stores/socket/socket.config';
import { useSocketStore } from '@/stores/socket/socket.store';

export const sendSocketMessage = (socketType: SocketNamespace, eventName: string, message: unknown): Promise<void> => {
  const socket = useSocketStore.getState().sockets[socketType];
  if (!socket) throw new Error(`${socketType} socket not connected`);
  return new Promise((resolve) => {
    socket.emit(eventName, message);
    resolve();
  });
};

export const sendGameMessage = (eventName: string, message?: unknown) =>
  sendSocketMessage(SocketNamespace.GAME, eventName, message);

export const sendChatMessage = (eventName: string, message?: unknown) =>
  sendSocketMessage(SocketNamespace.CHAT, eventName, message);

export const sendDrawingMessage = (eventName: string, message?: unknown) =>
  sendSocketMessage(SocketNamespace.DRAWING, eventName, message);
