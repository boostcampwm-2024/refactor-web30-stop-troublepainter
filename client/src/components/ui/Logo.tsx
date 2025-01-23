import { forwardRef, ImgHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CDN } from '@/constants/cdn';
import { cn } from '@/utils/cn';

const logoVariants = cva('w-auto', {
  variants: {
    variant: {
      main: 'h-40 sm:h-64',
      side: 'h-20 xs:h-24',
    },
  },
  defaultVariants: {
    variant: 'main',
  },
});

export type LogoVariant = 'main' | 'side';

interface LogoInfo {
  avif: string;
  webp: string;
  png: string;
  alt: string;
  description: string;
}

const LOGO_INFO: Record<LogoVariant, LogoInfo> = {
  main: {
    avif: CDN.MAIN_LOGO_AVIF,
    webp: CDN.MAIN_LOGO_WEBP,
    png: CDN.MAIN_LOGO_PNG,
    alt: '메인 로고',
    description: '우리 프로젝트를 대표하는 메인 로고 이미지입니다',
  },
  side: {
    avif: CDN.SIDE_LOGO_AVIF,
    webp: CDN.SIDE_LOGO_WEBP,
    png: CDN.MAIN_LOGO_PNG,
    alt: '보조 로고',
    description: '우리 프로젝트를 대표하는 보조 로고 이미지입니다',
  },
} as const;

export interface LogoProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'aria-label'>,
    VariantProps<typeof logoVariants> {
  /**
   * 로고 이미지 설명을 위한 사용자 정의 aria-label
   */
  ariaLabel?: string;
}

const Logo = forwardRef<HTMLImageElement, LogoProps>(({ className, variant = 'main', ariaLabel, ...props }, ref) => {
  const logoInfo = LOGO_INFO[variant as LogoVariant];

  return (
    <picture>
      <source srcSet={logoInfo.avif} type="image/avif" />
      <source srcSet={logoInfo.webp} type="image/webp" />
      <img
        src={logoInfo.png}
        alt={logoInfo.alt}
        aria-label={ariaLabel ?? logoInfo.description}
        className={cn(logoVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    </picture>
  );
});

Logo.displayName = 'Logo';

export { Logo, logoVariants };
