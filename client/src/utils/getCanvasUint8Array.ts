import { RefObject } from 'react';
import { checkWebPSupport } from './checkWebPSupport';

type Format = 'image/png' | 'image/jpeg' | 'image/webp';

export async function getCanvasUint8Array(canvasRef: RefObject<HTMLCanvasElement>, format: Format, quality?: number) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  let supportedFormat: Format = format;

  if (format === 'image/webp') {
    const webpSupported = checkWebPSupport();
    supportedFormat = webpSupported ? 'image/webp' : 'image/jpeg';
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        resolve(blob);
      },
      supportedFormat,
      quality,
    );
  });

  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
