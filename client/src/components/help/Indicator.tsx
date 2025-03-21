import { useEffect } from 'react';
import { IndicatorProps } from '@/types/help.types';
import { cn } from '@/utils/cn';

const Indicator = ({ pageData, pageIndicator, setPageIndex }: IndicatorProps) => {
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
    <div className="relative top-5 flex flex-row items-center justify-center p-5">
      {pageIndicator.map((isSelect, i) => {
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
  );
};

export default Indicator;
