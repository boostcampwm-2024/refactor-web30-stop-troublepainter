import { RefObject } from 'react';

type Format = 'image/png' | 'image/jpeg' | 'image/webp';

export async function getCanvasUint8Array(canvasRef: RefObject<HTMLCanvasElement>, format: Format, quality?: number) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        resolve(blob);
      },
      format,
      quality,
    );
  });

  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
