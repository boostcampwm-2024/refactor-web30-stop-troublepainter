import { sendChatMessage } from './socket.helper';

export const chatSocketHandlers = {
  sendMessage: (message: string): Promise<void> => {
    return sendChatMessage('sendMessage', { message: message.trim() });
  },
};

export type ChatSocketHandlers = typeof chatSocketHandlers;
