import { useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Indicator from './Indicator';
import { HelpPageProps } from '@/types/help.types';
import { cn } from '@/utils/cn';

const HelpPage = ({ pageData, isModalOpened, dotLottieRefCallback, pagenation, setPageIndex }: HelpPageProps) => {
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
      <Indicator pageData={pageData} pagenation={pagenation} setPageIndex={setPageIndex} />
    </div>
  );
};

export default HelpPage;
