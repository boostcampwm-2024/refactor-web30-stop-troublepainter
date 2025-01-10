import { RefObject, useCallback, useEffect, useRef } from 'react';
import { DrawingData, StrokeStyle } from '@troublepainter/core';
import { useDrawingState } from './useDrawingState';

/*
const checkOutsidePoint = (canvas: HTMLCanvasElement, point: Point) => {
  const { width, height } = canvas.getBoundingClientRect();
  if (point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height) return false;
  else return true;
};
*/

/**
 * 캔버스의 실제 드로잉 작업을 수행하는 Hook입니다.
 *
 * @remarks
 * 캔버스의 실제 드로잉 작업들을 관리합니다.
 * - 스트로크 그리기
 * - 영역 채우기 작업
 * - 캔버스 다시 그리기
 * - 스타일 관리
 *
 * useDrawingState와 함께 작동하여 드로잉 컨텍스트를 유지하고
 * 캔버스의 실제 픽셀 조작을 처리합니다.
 *
 * @param canvasRef - 캔버스 엘리먼트의 RefObject
 * @param state - useDrawingState에서 반환된 드로잉 상태
 *
 * @example
 * ```tsx
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * const state = useDrawingState({ maxPixels: 1000 });
 * const operations = useDrawingOperation(canvasRef, state);
 *
 * // 드로잉 작업 사용 예시
 * operations.drawStroke({
 *   points: [{x: 0, y: 0}, {x: 10, y: 10}],
 *   style: operations.getCurrentStyle()
 * });
 * ```
 *
 * @returns 드로잉 작업 메소드들을 포함하는 객체
 * @property getCurrentStyle - 현재 상태를 기반으로 스트로크 스타일을 반환하는 함수
 * @property drawStroke - 캔버스에 단일 스트로크를 그리는 함수
 * @property redrawCanvas - 저장된 스트로크들을 기반으로 전체 캔버스를 다시 그리는 함수
 * @property applyFill - 소켓에서 받아온 페인팅 좌표 배열을 그리는 함수
 * @property floodFill - 지정된 좌표에서 영역 채우기를 수행하는 함수
 *
 * @category Hooks
 */
export const useDrawingOperation = (
  canvasRef: RefObject<HTMLCanvasElement>,
  state: ReturnType<typeof useDrawingState>,
) => {
  const workerRef = useRef<Worker>();
  const isOffscreenInitialized = useRef<boolean>(false);
  const { currentColor, brushSize, inkRemaining, setInkRemaining } = state;

  useEffect(() => {
    if (!canvasRef.current || isOffscreenInitialized.current) return;

    if ('OffscreenCanvas' in window) {
      try {
        const offscreen = canvasRef.current.transferControlToOffscreen();
        workerRef.current = new Worker(new URL('./drawingWorker.ts', import.meta.url), { type: 'module' });
        workerRef.current.postMessage(
          {
            type: 'INIT',
            data: {
              canvas: offscreen,
              width: canvasRef.current.width,
              height: canvasRef.current.height,
            },
          },
          [offscreen],
        );

        isOffscreenInitialized.current = true;

        workerRef.current.addEventListener('message', (event) => {
          if (event.data.type === 'ERROR') {
            console.error('Worker error:', event.data.error);
          }
        });
      } catch (error) {
        console.error('Failed to initialize OffscreenCanvas:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = undefined;
        isOffscreenInitialized.current = false;
      }
    };
  }, []);

  const getCurrentStyle = useCallback(
    (): StrokeStyle => ({
      color: currentColor,
      width: brushSize,
    }),
    [currentColor, brushSize],
  );

  const drawStroke = useCallback((drawingData: DrawingData) => {
    if (!workerRef.current) return;

    workerRef.current.postMessage({
      type: 'DRAW_STROKE',
      data: {
        points: drawingData.points,
        style: drawingData.style,
      },
    });
  }, []);

  const applyFill = useCallback((drawingData: DrawingData) => {
    if (!workerRef.current) return;

    workerRef.current.postMessage({
      type: 'APPLY_FILL',
      data: { fillData: drawingData },
    });
  }, []);

  const floodFill = useCallback(
    (startX: number, startY: number): Promise<DrawingData | null> => {
      if (!workerRef.current) return Promise.resolve(null);

      return new Promise((resolve) => {
        const messageHandler = (event: MessageEvent) => {
          if (event.data.type === 'FILL_COMPLETE') {
            workerRef.current?.removeEventListener('message', messageHandler);
            setInkRemaining((prev: number) => Math.max(0, prev - event.data.pixelCount));

            resolve({
              points: event.data.points,
              style: getCurrentStyle(),
              timestamp: Date.now(),
            });
          } else if (event.data.type === 'ERROR') {
            console.error('Worker error:', event.data.error);
            resolve(null);
          }
        };

        if (workerRef.current) {
          workerRef.current.addEventListener('message', messageHandler);
          workerRef.current.postMessage({
            type: 'FLOOD_FILL',
            data: {
              startX,
              startY,
              color: currentColor,
              inkRemaining,
            },
          });
        }
      });
    },
    [currentColor, inkRemaining, getCurrentStyle, setInkRemaining],
  );

  const redrawCanvas = useCallback(() => {
    if (!workerRef.current || !state.crdtRef.current) return;

    workerRef.current.postMessage({ type: 'CLEAR' });

    const activeStrokes = state.crdtRef.current.getActiveStrokes();
    for (const { stroke } of activeStrokes) {
      if (stroke.points.length > 2) {
        applyFill(stroke);
      } else {
        drawStroke(stroke);
      }
    }
  }, [drawStroke, applyFill, state.crdtRef]);

  const clearCanvas = useCallback(() => {
    workerRef.current?.postMessage({ type: 'CLEAR' });
  }, []);

  return {
    getCurrentStyle,
    drawStroke,
    redrawCanvas,
    applyFill,
    floodFill,
    clearCanvas,
  };
};
