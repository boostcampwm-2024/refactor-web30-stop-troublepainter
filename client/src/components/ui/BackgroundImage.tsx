import { useState } from 'react';
import tiny from '@/assets/background-tiny.png';
import { CDN } from '@/constants/cdn';
import { cn } from '@/utils/cn';

interface BackgroundImageProps {
  className?: string;
}

const BackgroundImage = ({ className }: BackgroundImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <div className={cn('absolute inset-0', className)}>
        <img
          src={tiny}
          alt="배경 패턴"
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100',
          )}
        />
      </div>
      <picture className={cn('absolute inset-0', className)}>
        <source srcSet={CDN.BACKGROUND_IMAGE_AVIF} type="image/avif" />
        <source srcSet={CDN.BACKGROUND_IMAGE_WEBP} type="image/webp" />
        <img
          src={CDN.BACKGROUND_IMAGE_PNG}
          alt="배경 패턴"
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </>
  );
};

export default BackgroundImage;
