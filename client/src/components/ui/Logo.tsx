import { forwardRef, ImgHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import mainLogoAVIF from '@/assets/logo/main-logo.avif';
import mainLogoPNG from '@/assets/logo/main-logo.png';
import mainLogoWEBP from '@/assets/logo/main-logo.webp';
import sideLogoAVIF from '@/assets/logo/side-logo.avif';
import sideLogoPNG from '@/assets/logo/side-logo.png';
import sideLogoWEBP from '@/assets/logo/side-logo.webp';
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
    avif: mainLogoAVIF,
    webp: mainLogoWEBP,
    png: mainLogoPNG,
    alt: '메인 로고',
    description: '우리 프로젝트를 대표하는 메인 로고 이미지입니다',
  },
  side: {
    avif: sideLogoAVIF,
    webp: sideLogoWEBP,
    png: sideLogoPNG,
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
