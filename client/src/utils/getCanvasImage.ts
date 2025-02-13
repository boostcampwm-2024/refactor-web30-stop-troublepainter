import { RefObject } from 'react';
import { getCanvasContext } from './getCanvasContext';

type CanvasImage = 'jpeg' | 'png';

export function getCanvasImage(canvasRef: RefObject<HTMLCanvasElement>, format: CanvasImage, quality = 1) {
  const { canvas } = getCanvasContext(canvasRef);
  const dataURL = canvas.toDataURL(`image/${format}`, quality);
  return dataURL;
}
