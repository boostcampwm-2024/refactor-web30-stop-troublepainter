import { sendDrawingMessage } from './socket.helper';
import type { CRDTUpdateMessage, DrawingData } from '@troublepainter/core';

export const drawingSocketHandlers = {
  // 드로잉 데이터 전송
  sendDrawing: (message: CRDTUpdateMessage<DrawingData>): Promise<void> => {
    return sendDrawingMessage('draw', { drawingData: message });
  },
};

export type DrawSocketHandlers = typeof drawingSocketHandlers;
