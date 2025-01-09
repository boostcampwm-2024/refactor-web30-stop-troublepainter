import { MutableRefObject, useEffect, useRef } from 'react';
import { Point } from '@troublepainter/core';
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

export const drawingTest = (pointReceiver: MutableRefObject<Worker | Point[] | undefined>, num: number) => {
  const timer = useRef<NodeJS.Timeout>();
  const startTime = performance.now();

  const printResult = (finishTime: DOMHighResTimeStamp) => {
    console.log('type : ', pointReceiver);
    console.log('startTIme : ', startTime, 'endTime : ', finishTime);
    console.log('total : ', finishTime - startTime);
  };

  useEffect(() => {
    coordinates.length = num;
    coordinates.push({ x: -1, y: -1 });
    const generator = getOnePoint();

    timer.current = setInterval(() => {
      const points = generator.next().value;
      if (!points) {
        clearInterval(timer.current);
        return;
      }
      if (!pointReceiver.current) return;
      if ('postMessage' in pointReceiver.current)
        pointReceiver.current.postMessage({ type: 'draw', value: { point: points } });
      else {
        pointReceiver.current.push(points);

        if (points.x == -1) {
          console.log('Worker has signaled the end.');
          printResult(performance.now());
        }
      }
    }, 16);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return printResult;
};
