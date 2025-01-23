import { MouseEvent, TouchEvent } from 'react';
import { DrawingData } from '@troublepainter/core';
import { DRAWING_MODE } from '@/constants/canvasConstants';

interface PenOptions {
  mode: number;
  colorNum: number;
  lineWidth: number;
}

export type SelectingPenOptions = Partial<PenOptions>;

export type PenModeType = (typeof DRAWING_MODE)[keyof typeof DRAWING_MODE];

export interface CanvasStore {
  canDrawing: boolean;
  penSetting: PenOptions;
  action: {
    setCanDrawing: (canDrawing: boolean) => void;
    setPenSetting: (penSetting: SelectingPenOptions) => void;
    setPenMode: (penMode: PenModeType) => void;
  };
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface StrokeHistoryEntry {
  strokeIds: string[];
  isLocal: boolean;
  drawingData: DrawingData;
  timestamp: number;
}

export interface DrawingOptions {
  maxPixels?: number;
}

export type WorkerMessageType =
  | 'INIT'
  | 'INIT_COMPLETE'
  | 'DRAW_STROKE'
  | 'DRAW_COMPLETE'
  | 'FLOOD_FILL'
  | 'FILL_COMPLETE'
  | 'APPLY_FILL'
  | 'APPLY_FILL_COMPLETE'
  | 'CLEAR'
  | 'CLEAR_COMPLETE'
  | 'ERROR';

export type DrawingMode = (typeof DRAWING_MODE)[keyof typeof DRAWING_MODE];

export interface CanvasEventHandlers {
  onMouseDown?: (e: MouseEvent<HTMLCanvasElement>) => Promise<void>;
  onMouseMove?: (e: MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: (e: MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLCanvasElement>) => void;
  onTouchStart?: (e: TouchEvent<HTMLCanvasElement>) => Promise<void>;
  onTouchMove?: (e: TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd?: (e: TouchEvent<HTMLCanvasElement>) => void;
  onTouchCancel?: (e: TouchEvent<HTMLCanvasElement>) => void;
}
