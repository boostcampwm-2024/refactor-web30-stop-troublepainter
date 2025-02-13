import { RefObject } from 'react';

export async function getCanvasUint8Array(canvasRef: RefObject<HTMLCanvasElement>) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob from canvas');
      }
      resolve(blob);
    });
  });

  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
