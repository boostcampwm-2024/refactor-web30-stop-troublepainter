import { useEffect, useRef, MouseEvent } from 'react';
import { CURSOR_LENGTH, CURSOR_WIDTH, DELETE_INTERVAL } from '@/constants/backgroundConstants';
import { drawingTest } from '@/hooks/test/drawingTest';
import { getCanvasContextOnly } from '@/utils/getCanvasContextOnly';
import { getDrawPoint } from '@/utils/getDrawPoint';

const Background = ({ className }: { className: string }) => {
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);

  const currentTimestamp = useRef(performance.now());
  const lastTimestamp = useRef(performance.now());

  const offScreenCanvas = useRef<OffscreenCanvas>();
  const worker = useRef<Worker>();

  const printTestResult = drawingTest(worker);

  // 커서 그리기
  useEffect(() => {
    const { canvas } = getCanvasContextOnly(cursorCanvasRef);
    if (!offScreenCanvas.current) {
      offScreenCanvas.current = canvas.transferControlToOffscreen();
      worker.current = new Worker(new URL('../../worker/offscreencanvas.ts', import.meta.url), { type: 'module' });
      worker.current.postMessage(
        {
          type: 'canvas',
          value: {
            canvas: offScreenCanvas.current,
            length: CURSOR_LENGTH,
            width: CURSOR_WIDTH,
            interval: DELETE_INTERVAL,
          },
        },
        [offScreenCanvas.current],
      );

      worker.current.onmessage = (event) => {
        const data = event.data;
        if (data.message === 'end') {
          console.log('Worker has signaled the end.');
          printTestResult(performance.now());
        }
      };
    }

    const handleResize = () => {
      if (worker.current)
        worker.current.postMessage({
          type: 'resize',
          value: { width: canvas.offsetWidth, height: canvas.offsetHeight },
        });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (worker.current) {
        //worker.current.postMessage({ type: 'stop' });
        //worker.current.terminate();
      }
    };
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    currentTimestamp.current = performance.now();
    if (currentTimestamp.current - lastTimestamp.current < 16) return;
    lastTimestamp.current = currentTimestamp.current;

    const { canvas } = getCanvasContextOnly(cursorCanvasRef);
    const point = getDrawPoint(e, canvas);
    if (worker.current) worker.current.postMessage({ type: 'draw', value: { point } });
  };

  const handleMouseLeave = () => {
    if (worker.current) worker.current.postMessage({ type: 'clear' });
  };

  return (
    <div className={className}>
      <canvas
        ref={cursorCanvasRef}
        className="absolute h-full w-full cursor-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export default Background;
