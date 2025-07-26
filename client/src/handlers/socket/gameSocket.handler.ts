import { CheckDrawingRequest } from 'node_modules/@troublepainter/core';
import { sendGameMessage } from './socket.helper';
import type {
  CRDTSyncMessage,
  CheckAnswerRequest,
  DrawingData,
  JoinRoomRequest,
  ReconnectRequest,
  UpdateSettingsRequest,
} from '@troublepainter/core';

// socket 요청만 처리하는 핸들러
export const gameSocketHandlers = {
  joinRoom: (message: JoinRoomRequest): Promise<void> => {
    return sendGameMessage('joinRoom', message);
  },

  reconnect: (message: ReconnectRequest): Promise<void> => {
    return sendGameMessage('reconnect', message);
  },

  updateSettings: (message: UpdateSettingsRequest): Promise<void> => {
    return sendGameMessage('updateSettings', message);
  },

  gameStart: (): Promise<void> => {
    return sendGameMessage('gameStart');
  },

  checkAnswer: (message: CheckAnswerRequest): Promise<void> => {
    return sendGameMessage('checkAnswer', message);
  },

  submittedDrawing: (message: CRDTSyncMessage<DrawingData>): Promise<void> => {
    return sendGameMessage('submittedDrawing', message);
  },

  checkDrawing: (message: CheckDrawingRequest): Promise<void> => {
    return sendGameMessage('checkDrawing', message);
  },
};

export type GameSocketHandlers = typeof gameSocketHandlers;
