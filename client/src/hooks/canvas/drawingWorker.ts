import { DrawingData, Point, StrokeStyle } from '@troublepainter/core';
import { RGBA } from '@/types/canvas.types';
import { hexToRGBA } from '@/utils/hexToRGBA';

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

const fillTargetColor = (pos: number, fillColor: RGBA, pixelArray: Uint8ClampedArray) => {
  pixelArray[pos] = fillColor.r;
  pixelArray[pos + 1] = fillColor.g;
  pixelArray[pos + 2] = fillColor.b;
  pixelArray[pos + 3] = fillColor.a;
};

const checkColorisNotEqual = (pos: number, startColor: RGBA, pixelArray: Uint8ClampedArray) => {
  return (
    pixelArray[pos] !== startColor.r ||
    pixelArray[pos + 1] !== startColor.g ||
    pixelArray[pos + 2] !== startColor.b ||
    pixelArray[pos + 3] !== startColor.a
  );
};

const drawStroke = (points: Point[], style: StrokeStyle) => {
  if (!ctx) throw new Error('Context not initialized');

  ctx.beginPath();
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (points.length === 1) {
    const point = points[0];
    ctx.arc(point.x, point.y, style.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => ctx!.lineTo(point.x, point.y));
    ctx.stroke();
  }
};

const floodFill = (startX: number, startY: number, color: string, inkRemaining: number) => {
  if (!ctx || !canvas) throw new Error('Canvas not initialized');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelArray = imageData.data;
  const fillColor = hexToRGBA(color);

  const startPos = (startY * canvas.width + startX) * 4;
  const startColor = {
    r: pixelArray[startPos],
    g: pixelArray[startPos + 1],
    b: pixelArray[startPos + 2],
    a: pixelArray[startPos + 3],
  };

  const pixelsToCheck: [number, number][] = [[startX, startY]];
  let pixelCount = 0;
  const filledPoints: Point[] = [];

  while (pixelsToCheck.length > 0 && pixelCount <= inkRemaining) {
    const [x, y] = pixelsToCheck.shift()!;
    if (!canvas) throw new Error('Canvas not initialized');
    const pos = (y * canvas.width + x) * 4;

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height || checkColorisNotEqual(pos, startColor, pixelArray))
      continue;

    fillTargetColor(pos, fillColor, pixelArray);
    filledPoints.push({ x, y });
    pixelsToCheck.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    pixelCount++;
  }

  ctx.putImageData(imageData, 0, 0);

  return {
    points: filledPoints,
    pixelCount,
  };
};

const applyFill = (fillData: DrawingData) => {
  if (!ctx || !canvas) throw new Error('Canvas not initialized');

  const { points, style } = fillData;
  const fillColor = hexToRGBA(style.color);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelArray = imageData.data;

  points.forEach(({ x, y }) => {
    if (!canvas) throw new Error('Canvas not initialized');
    const pos = (y * canvas.width + x) * 4;
    fillTargetColor(pos, fillColor, pixelArray);
  });

  ctx.putImageData(imageData, 0, 0);
};

interface InitData {
  canvas: OffscreenCanvas;
  width?: number;
  height?: number;
  points?: Point[];
  style?: StrokeStyle;
  startX?: number;
  startY?: number;
  color?: string;
  inkRemaining?: number;
  fillData?: DrawingData;
}

self.onmessage = function (event: MessageEvent<{ type: string; data: InitData }>) {
  try {
    const { type, data } = event.data;

    switch (type) {
      case 'INIT': {
        if (!data?.canvas) {
          throw new Error('Canvas is required for initialization');
        }
        canvas = data.canvas;
        ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get 2D context');
        }
        canvas.width = data.width || 800;
        canvas.height = data.height || 600;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        self.postMessage({ type: 'INIT_COMPLETE' });
        break;
      }

      case 'DRAW_STROKE': {
        if (!ctx || !canvas) {
          throw new Error('Canvas not initialized');
        }
        if (!data?.points || !data?.style) {
          throw new Error('Points and style are required for drawing');
        }
        drawStroke(data.points, data.style);
        self.postMessage({ type: 'DRAW_COMPLETE' });
        break;
      }

      case 'FLOOD_FILL': {
        if (!ctx || !canvas) {
          throw new Error('Canvas not initialized');
        }
        const result = floodFill(
          data.startX ?? 0,
          data.startY ?? 0,
          data.color ?? '#000000',
          data.inkRemaining ?? Number.MAX_SAFE_INTEGER,
        );
        self.postMessage({
          type: 'FILL_COMPLETE',
          points: result.points,
          pixelCount: result.pixelCount,
        });
        break;
      }

      case 'APPLY_FILL': {
        if (!ctx || !canvas) {
          throw new Error('Canvas not initialized');
        }
        if (!data?.fillData) {
          throw new Error('Fill data is required');
        }
        applyFill(data.fillData);
        self.postMessage({ type: 'APPLY_FILL_COMPLETE' });
        break;
      }

      case 'CLEAR': {
        if (!ctx || !canvas) {
          throw new Error('Canvas not initialized');
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        self.postMessage({ type: 'CLEAR_COMPLETE' });
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
