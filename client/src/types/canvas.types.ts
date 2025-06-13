import { PointerEvent } from 'react';
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

export type DrawingMode = (typeof DRAWING_MODE)[keyof typeof DRAWING_MODE];

export interface CanvasEventHandlers {
  onPointerDown?: (e: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove?: (e: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLCanvasElement>) => void;
  onPointerLeave?: (e: PointerEvent<HTMLCanvasElement>) => void;
  onPointerCancel?: (e: PointerEvent<HTMLCanvasElement>) => void;
}
