import { useState } from 'react';
import tiny from '@/assets/background/background-tiny.png';
import backgroundAVIF from '@/assets/background/background.avif';
import backgroundPNG from '@/assets/background/background.png';
import backgroundWEBP from '@/assets/background/background.webp';
import { cn } from '@/utils/cn';

const BackgroundImage = ({ className }: { className: string }) => {
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
        <source srcSet={backgroundAVIF} type="image/avif" />
        <source srcSet={backgroundWEBP} type="image/webp" />
        <img
          src={backgroundPNG}
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
