import { MutableRefObject, useEffect, useRef } from 'react';
import { coordinates } from './drawingTestPoints';

function* getOnePoint(): Generator<
  {
    x: number;
    y: number;
  },
  void,
  unknown
> {
  for (const points of coordinates) {
    yield points;
  }
}

export const drawingTest = (workerRef: MutableRefObject<Worker | undefined>) => {
  const timer = useRef<NodeJS.Timeout>();
  const startTime = performance.now();

  useEffect(() => {
    const generator = getOnePoint();

    timer.current = setInterval(() => {
      const points = generator.next().value;
      if (!points) {
        clearInterval(timer.current);
        return;
      }
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'draw', value: { point: points } });
      }
    }, 16);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const printResult = (finishTime: DOMHighResTimeStamp) => {
    console.log('startTIme : ', startTime, 'endTime : ', finishTime);
    console.log('total : ', finishTime - startTime);
  };
  return printResult;
};
