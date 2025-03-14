import { useEffect, useState } from 'react';

export const Loading = () => {
  const [barCount, setBarCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setBarCount((prevCount) => (prevCount >= 10 ? 1 : prevCount + 1));
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen min-w-80 bg-violet-950 bg-fixed antialiased">
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2">
        <span className="text-3xl text-violet-300">LOADING...</span>
        <div className="relative h-14 w-full max-w-64 border-8 border-violet-300">
          <div className="absolute -left-2 -top-2 h-2 w-2 bg-slate-950" />
          <div className="absolute -right-2 -top-2 h-2 w-2 bg-slate-950" />
          <div className="absolute -bottom-2 -left-2 h-2 w-2 bg-slate-950" />
          <div className="absolute -bottom-2 -right-2 h-2 w-2 bg-slate-950" />
          <div className="grid h-full grid-cols-10 gap-2 p-2">
            {Array.from({ length: barCount }).map((_, index) => (
              <div key={index} className="relative h-full bg-violet-300">
                <div className="absolute bottom-0 h-1/2 w-full bg-violet-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
