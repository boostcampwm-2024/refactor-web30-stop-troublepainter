import { CDN } from '@/constants/cdn';
import { cn } from '@/utils/cn';

interface BackgroundImageProps {
  className?: string;
}

const BackgroundImage = ({ className }: BackgroundImageProps) => {
  return (
    <>
      <picture className={cn('absolute inset-0', className)}>
        <source srcSet={CDN.BACKGROUND_IMAGE_AVIF} type="image/avif" />
        <source srcSet={CDN.BACKGROUND_IMAGE_WEBP} type="image/webp" />
        <img
          src={CDN.BACKGROUND_IMAGE_PNG}
          alt="배경 패턴"
          className={cn('h-full w-full object-cover transition-opacity duration-300')}
        />
      </picture>
    </>
  );
};

export default BackgroundImage;
