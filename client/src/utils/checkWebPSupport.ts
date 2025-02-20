/**
 * WebP 이미지 포맷을 지원하는지 확인하는 함수입니다.
 *
 * 이 함수는 브라우저에서 WebP 포맷을 지원하는지 여부를 확인하여,
 * 지원하면 `true`를, 지원하지 않으면 `false`를 반환합니다.
 *
 * @returns {boolean} WebP 포맷 지원 여부
 *
 * @example
 * ```typescript
 * const webpSupported = checkWebPSupport();
 * ```
 * @category Utils
 */

export function checkWebPSupport() {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}
