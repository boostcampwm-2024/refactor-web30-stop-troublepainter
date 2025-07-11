import { RefObject, useCallback } from 'react';
import { DrawingData, DrawType, Point, StrokeStyle } from '@troublepainter/core';
import { useDrawingState } from './useDrawingState';
import { MAINCANVAS_RESOLUTION_HEIGHT, MAINCANVAS_RESOLUTION_WIDTH } from '@/constants/canvasConstants';
import { RGBA } from '@/types/canvas.types';
import { getCanvasContext } from '@/utils/getCanvasContext';
import { hexToRGBA } from '@/utils/hexToRGBA';

const fillTargetColor = (pos: number, fillColor: RGBA, pixelArray: Uint8ClampedArray) => {
  pixelArray[pos] = fillColor.r;
  pixelArray[pos + 1] = fillColor.g;
  pixelArray[pos + 2] = fillColor.b;
  pixelArray[pos + 3] = fillColor.a;
};

const checkColorisEqual = (pos: number, startColor: RGBA, pixelArray: Uint8ClampedArray) => {
  return (
    pixelArray[pos] === startColor.r &&
    pixelArray[pos + 1] === startColor.g &&
    pixelArray[pos + 2] === startColor.b &&
    pixelArray[pos + 3] === startColor.a
  );
};

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
 * @property renderStroke - 그림 타입에 따라 그림을 그리는 함수
 *
 * @category Hooks
 */
export const useDrawingOperation = (
  canvasRef: RefObject<HTMLCanvasElement>,
  state: ReturnType<typeof useDrawingState>,
) => {
  const { currentColor, brushSize, inkRemaining, setInkRemaining } = state;

  const getCurrentStyle = useCallback(
    (): StrokeStyle => ({
      color: currentColor,
      width: brushSize,
    }),
    [currentColor, brushSize],
  );

  const renderStroke = (drawingData: DrawingData) => {
    switch (drawingData.type) {
      case DrawType.FILL:
        const { x, y } = drawingData.points[0];
        floodFill(x, y, drawingData.style.color, drawingData.inkRemaining);
        break;

      case DrawType.PEN:
        if (drawingData.points.length > 3) {
          applyFill(drawingData);
        } else {
          drawStroke(drawingData);
        }
    }
  };

  const drawStroke = (drawingData: DrawingData): void => {
    const { ctx } = getCanvasContext(canvasRef);
    const { points, style } = drawingData;

    // 스타일 설정
    ctx.strokeStyle = style.color;
    ctx.fillStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // path 설정
    ctx.beginPath();

    // 점의 개수에 따른 그리기 처리
    switch (points.length) {
      case 1: {
        // 단일 점은 원으로 표현
        ctx.arc(points[0].x, points[0].y, style.width / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 2: {
        // 두 점은 직선으로 연결
        const mid1x = (points[0].x + points[1].x) >> 1;
        const mid1y = (points[0].y + points[1].y) >> 1;
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(mid1x, mid1y);
        ctx.stroke();
        break;
      }
      case 3: {
        // 세 점은 부드러운 곡선으로 연결
        const [p0, p1, p2] = points;

        // 비트 연산을 사용한 중간점 계산
        // x >> 1은 x / 2와 동일하지만 더 빠름
        const mid1x = (p0.x + p1.x) >> 1;
        const mid1y = (p0.y + p1.y) >> 1;
        const mid2x = (p1.x + p2.x) >> 1;
        const mid2y = (p1.y + p2.y) >> 1;

        // 중간점 객체 생성을 피하고 직접 좌표 사용
        ctx.moveTo(mid1x, mid1y);
        ctx.quadraticCurveTo(p1.x, p1.y, mid2x, mid2y);
        ctx.stroke();
        break;
      }
    }
  };

  const redrawCanvas = useCallback(() => {
    if (!state.crdtRef.current) return;

    const { canvas, ctx } = getCanvasContext(canvasRef);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sortedStrokes = state.crdtRef.current.sortedStrokes;
    for (const { value: drawingData } of sortedStrokes) {
      renderStroke(drawingData);
    }
  }, [drawStroke]);

  const applyFill = (drawingData: DrawingData) => {
    const { canvas, ctx } = getCanvasContext(canvasRef);
    const { points, style } = drawingData;

    if (points.length === 0) return;

    const color = hexToRGBA(style.color);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    points.forEach(({ x, y }) => {
      const pos = (y * canvas.width + x) * 4;
      fillTargetColor(pos, color, data);
    });

    ctx.putImageData(imageData, 0, 0);
  };

  const floodFill = useCallback(
    (startX: number, startY: number, color: string, inkRemaining: number, options: { dryRun?: boolean } = {}) => {
      const { canvas, ctx } = getCanvasContext(canvasRef);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelArray = imageData.data;
      const fillColor = hexToRGBA(color);
      const { dryRun = false } = options;

      const startPos = (startY * canvas.width + startX) * 4;
      const startColor = {
        r: pixelArray[startPos],
        g: pixelArray[startPos + 1],
        b: pixelArray[startPos + 2],
        a: pixelArray[startPos + 3],
      };

      const pixelsToCheck = [[startX, startY]];
      const checkArray = new Array(MAINCANVAS_RESOLUTION_HEIGHT)
        .fill(null)
        .map(() => new Array(MAINCANVAS_RESOLUTION_WIDTH).fill(false));
      let pixelCount = 1;
      const filledPoints: Point[] = [{ x: startX, y: startY }];

      while (pixelsToCheck.length > 0 && pixelCount <= inkRemaining) {
        const [currentX, currentY] = pixelsToCheck.shift()!;
        for (const move of [
          [1, 0],
          [0, -1],
          [-1, 0],
          [0, 1],
        ]) {
          const [nextX, nextY] = [currentX + move[0], currentY + move[1]];
          if (
            nextX < 0 ||
            nextX >= MAINCANVAS_RESOLUTION_WIDTH ||
            nextY < 0 ||
            nextY >= MAINCANVAS_RESOLUTION_HEIGHT ||
            checkArray[nextY][nextX]
          )
            continue;

          const nextArrayIndex = (nextY * MAINCANVAS_RESOLUTION_WIDTH + nextX) * 4;

          if (!checkColorisEqual(nextArrayIndex, startColor, pixelArray)) continue;

          checkArray[nextY][nextX] = true;
          fillTargetColor(nextArrayIndex, fillColor, pixelArray);
          pixelsToCheck.push([nextX, nextY]);
          filledPoints.push({ x: nextX, y: nextY });
          pixelCount++;
        }
      }

      if (!dryRun) ctx.putImageData(imageData, 0, 0);

      return {
        pixelCount,
      };
    },
    [currentColor, inkRemaining, getCurrentStyle, setInkRemaining],
  );

  const clearCanvas = useCallback(() => {
    const { canvas, ctx } = getCanvasContext(canvasRef);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return {
    getCurrentStyle,
    drawStroke,
    redrawCanvas,
    renderStroke,
    applyFill,
    floodFill,
    clearCanvas,
  };
};
