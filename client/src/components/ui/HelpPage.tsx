import { useEffect } from 'react';
import { DotLottie, DotLottieReact } from '@lottiefiles/dotlottie-react';
import { PageData } from '@/types/help.types';
import { cn } from '@/utils/cn';

const HelpPage = ({
  pageData,
  isModalOpened,
  dotLottieRefCallback,
  pagenation,
  setPageIndex,
}: {
  pageData: PageData;
  isModalOpened: boolean;
  dotLottieRefCallback: (dot: DotLottie) => void;
  pagenation: boolean[];
  setPageIndex: (index: number) => void;
}) => {
  useEffect(() => {
    const loadAnimation = async () => {
      const response = await fetch(pageData.img);
      const blob = await response.blob();
      pageData.cache = URL.createObjectURL(blob);
    };

    if (!pageData.cache) {
      void loadAnimation();
    }
  }, [pageData.img]);

  return (
    <div className="w-full">
      <section className={cn('w-full')}>
        <article className="relative">
          <DotLottieReact
            src={pageData.cache ?? pageData.img}
            loop
            autoplay={isModalOpened}
            style={{ height: 300 }}
            dotLottieRefCallback={dotLottieRefCallback}
          />

          <div className="flex flex-col items-center justify-center rounded-md bg-violet-50 py-6">
            {pageData.contents.map((line, i) => (
              <p key={i} className="text-base md:text-lg lg:text-xl xl:text-2xl">
                {line}
              </p>
            ))}
          </div>
        </article>
      </section>
      <div className="relative top-5 flex flex-row items-center justify-center p-5">
        {pagenation.map((isSelect, i) => {
          return (
            <button
              key={i}
              className={cn(
                'mx-1.5 box-content h-2.5 w-2.5 rounded-full md:h-3 md:w-3',
                isSelect ? 'border-4 border-halfbaked-300 bg-chartreuseyellow-300' : 'bg-eastbay-600',
              )}
              onClick={() => {
                setPageIndex(i);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HelpPage;
