const CDN_BASE = 'https://kr.object.ncloudstorage.com/troublepainter-assets';

export const CDN = {
  BACKGROUND_MUSIC: `${CDN_BASE}/sounds/background-music.mp3`,

  BACKGROUND_IMAGE_PNG: `${CDN_BASE}/patterns/background.png`,
  BACKGROUND_IMAGE_WEBP: `${CDN_BASE}/patterns/background.webp`,
  BACKGROUND_IMAGE_AVIF: `${CDN_BASE}/patterns/background.avif`,

  MAIN_LOGO_PNG: `${CDN_BASE}/logo/main-logo.png`,
  MAIN_LOGO_WEBP: `${CDN_BASE}/logo/main-logo.webp`,
  MAIN_LOGO_AVIF: `${CDN_BASE}/logo/main-logo.avif`,

  SIDE_LOGO_PNG: `${CDN_BASE}/logo/side-logo.png`,
  SIDE_LOGO_WEBP: `${CDN_BASE}/logo/side-logo.webp`,
  SIDE_LOGO_AVIF: `${CDN_BASE}/logo/side-logo.avif`,

  // tailwind config 설정
  // BACKGROUND: `${CDN_BASE}/patterns/background.png`,
} as const;
