import { useRef, TouchEvent as ReactTouchEvent, MouseEvent as ReactMouseEvent } from 'react';
import { PENMODE } from '@/constants/canvasConstants';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { CanvasStore, RGBA } from '@/types/canvas.types';
import { hexToRGBA } from '@/utils/hexToRGBA';

const CANVAS_SIZE_WIDTH = 640; //임시 사이즈
const CANVAS_SIZE_HEIGHT = 420;

const CV = ['#000', '#f257c9', '#e2f724', '#4eb4c2', '#d9d9d9'];
//임시 색상 배열

const getTouchPoint = (canvas: HTMLCanvasElement, e: TouchEvent) => {
  const { clientX, clientY } = e.touches[0]; //뷰포트 기준
  const { top, left } = canvas.getBoundingClientRect(); // 캔버스의 뷰포트 기준 위치
  return [clientX - left, clientY - top];
};

const getDrawPoint = (
  e: ReactTouchEvent<HTMLCanvasElement> | ReactMouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
) => {
  if (!canvas) new Error('canvas element가 없습니다.');

  if (e.nativeEvent instanceof MouseEvent) return [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
  else if (e.nativeEvent instanceof TouchEvent) return getTouchPoint(canvas, e.nativeEvent);
  else throw new Error('mouse 혹은 touch 이벤트가 아닙니다.');
};

const fillTargetColor = (index: number, targetColor: RGBA, pixelArray: Uint8ClampedArray) => {
  pixelArray[index] = targetColor.r;
  pixelArray[index + 1] = targetColor.g;
  pixelArray[index + 2] = targetColor.b;
  pixelArray[index + 3] = targetColor.a;
};

const checkColorisEqual = (nextIndex: number, beforeColor: RGBA, pixelArray: Uint8ClampedArray) => {
  return (
    pixelArray[nextIndex] === beforeColor.r &&
    pixelArray[nextIndex + 1] === beforeColor.g &&
    pixelArray[nextIndex + 2] === beforeColor.b &&
    pixelArray[nextIndex + 3] === beforeColor.a
  );
};

const searchFillAreaBFS = (offsetX: number, offsetY: number, targetColor: RGBA, pixelArray: Uint8ClampedArray) => {
  const clickIndex = (offsetY * CANVAS_SIZE_WIDTH + offsetX) * 4;
  const clickColor = {
    r: pixelArray[clickIndex],
    g: pixelArray[clickIndex + 1],
    b: pixelArray[clickIndex + 2],
    a: pixelArray[clickIndex + 3],
  };

  const checkArray = new Array(CANVAS_SIZE_HEIGHT).fill(null).map(() => new Array(CANVAS_SIZE_WIDTH).fill(false));
  const searchArray = [[offsetX, offsetY]];
  checkArray[offsetY][offsetX] = true;
  fillTargetColor(clickIndex, targetColor, pixelArray);

  const movement = [
    [1, 0],
    [0, -1],
    [-1, 0],
    [0, 1],
  ];

  while (searchArray.length > 0) {
    const [currentX, currentY] = searchArray.shift()!;
    for (const move of movement) {
      const [nextX, nextY] = [currentX + move[0], currentY + move[1]];
      if (
        nextX >= 0 &&
        nextX < CANVAS_SIZE_WIDTH &&
        nextY >= 0 &&
        nextY < CANVAS_SIZE_HEIGHT &&
        !checkArray[nextY][nextX]
      ) {
        const nextArrayIndex = (nextY * CANVAS_SIZE_WIDTH + nextX) * 4;
        if (checkColorisEqual(nextArrayIndex, clickColor, pixelArray)) {
          checkArray[nextY][nextX] = true;
          fillTargetColor(nextArrayIndex, targetColor, pixelArray);
          searchArray.push([nextX, nextY]);
        }
      }
    }
  }
};

export const paintCanvas = (offsetX: number, offsetY: number, ctx: CanvasRenderingContext2D, targetColor: RGBA) => {
  const canvasImageData = ctx.getImageData(0, 0, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT);
  const pixelArray = canvasImageData.data;

  searchFillAreaBFS(offsetX, offsetY, targetColor, pixelArray);
  ctx.putImageData(canvasImageData, 0, 0);
};

const MainCanvas = () => {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const canDrawing = useCanvasStore((state: CanvasStore) => state.canDrawing);
  const setCanDrawing = useCanvasStore((state: CanvasStore) => state.action.setCanDrawing);
  const penSetting = useCanvasStore((state: CanvasStore) => state.penSetting);

  const drawStartPath = (ctx: CanvasRenderingContext2D, drawX: number, drawY: number) => {
    ctx.beginPath();
    ctx.fillStyle = CV[penSetting.colorNum];
    ctx.strokeStyle = CV[penSetting.colorNum];
    ctx.lineWidth = penSetting.lineWidth;

    ctx.arc(drawX, drawY, penSetting.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(drawX, drawY);
  };

  const handleStartDrawingEvent = (e: ReactTouchEvent<HTMLCanvasElement> | ReactMouseEvent<HTMLCanvasElement>) => {
    if (canDrawing) return;
    if (!mainCanvasRef.current) return;

    const canvas = mainCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const [drawX, drawY] = getDrawPoint(e, canvas);
      if (penSetting.mode === PENMODE.PAINTER)
        paintCanvas(Math.floor(drawX), Math.floor(drawY), ctx, hexToRGBA(CV[penSetting.colorNum]));
      else drawStartPath(ctx, drawX, drawY);
    } catch (err) {
      throw err;
    }

    setCanDrawing(true);
  };

  const handleDrawingEvent = (e: ReactTouchEvent<HTMLCanvasElement> | ReactMouseEvent<HTMLCanvasElement>) => {
    if (!canDrawing || penSetting.mode === PENMODE.PAINTER) return;
    if (!mainCanvasRef.current) return;

    const canvas = mainCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const [drawX, drawY] = getDrawPoint(e, canvas);
      ctx.lineTo(drawX, drawY);
      ctx.stroke();
    } catch (err) {
      throw err;
    }
  };

  const handleStopDrawingEvent = () => {
    setCanDrawing(false);
  };

  return (
    <section>
      <canvas
        className="touch-none border border-black"
        ref={mainCanvasRef}
        width={CANVAS_SIZE_WIDTH}
        height={CANVAS_SIZE_HEIGHT}
        onMouseDown={handleStartDrawingEvent}
        onTouchStart={handleStartDrawingEvent}
        onMouseMove={handleDrawingEvent}
        onTouchMove={handleDrawingEvent}
        onMouseUp={handleStopDrawingEvent}
        onMouseLeave={handleStopDrawingEvent}
        onTouchEnd={handleStopDrawingEvent}
        onTouchCancel={handleStopDrawingEvent}
      >
        <img src="/" /> {/* canvas 지원하지 않는 브라우저일 경우 대체 이미지 */}
      </canvas>
    </section>
  );
};

export default MainCanvas;
