import { RefObject } from 'react';
import { checkWebPSupport } from './checkWebPSupport';

type Format = 'image/png' | 'image/jpeg' | 'image/webp';

/**
 * 캔버스 요소를 지정된 이미지 형식으로 변환하고, `Uint8Array`로 반환합니다.
 * WebP 형식을 요청했지만 지원되지 않는 경우 JPEG로 대체됩니다.
 *
 * @param {RefObject<HTMLCanvasElement>} canvasRef - 캔버스 요소를 가리키는 React ref 객체.
 * @param {Format} format - 원하는 이미지 형식 ('image/png', 'image/jpeg', 'image/webp').
 * @param {number} [quality] - 손실 압축 형식(JPEG/WebP)의 경우 품질 (0~1 범위).
 * @returns {Promise<Uint8Array | undefined>} 이미지 데이터를 포함하는 `Uint8Array` 또는 캔버스가 없을 경우 `undefined`.
 *
 * @throws {Error} 캔버스에서 Blob 생성에 실패하면 오류가 발생합니다.
 *
 * @example
 * ```typescript
 * const uint8Array = await getCanvasUint8Array(canvasRef, 'image/webp', 0.8);
 * ```
 * @category Utils
 */

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
