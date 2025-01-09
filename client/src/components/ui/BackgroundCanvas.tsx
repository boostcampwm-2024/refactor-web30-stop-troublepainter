/* 1. 워크 캔버스 추가 코드
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

  const printTestResult = drawingTest(worker, 2000);

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


/* 2. 기존 코드 - mousemove 핸들러에서 getContextContextOnly 메소드 사용 (Canvas 요소객체만 가져옴) 부분만 수정됨 */
import { useEffect, useRef, MouseEvent } from 'react';
import { Point } from '@troublepainter/core';
import { CURSOR_LENGTH, CURSOR_WIDTH, DELETE_INTERVAL } from '@/constants/backgroundConstants';
import { drawingTest } from '@/hooks/test/drawingTest';
import { getCanvasContext } from '@/utils/getCanvasContext';
import { getCanvasContextOnly } from '@/utils/getCanvasContextOnly';
import { getDrawPoint } from '@/utils/getDrawPoint';

const Background = ({ className }: { className: string }) => {
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorAnimation = useRef<number>();

  const pointsRef = useRef<Point[]>([]);

  const drawTimeRef = useRef(performance.now());
  const deleteTimeRef = useRef(performance.now());

  const currentTimestamp = useRef(performance.now());
  const lastTimestamp = useRef(performance.now());

  drawingTest(pointsRef, 2000);

  // 커서 그리기
  useEffect(() => {
    const { canvas, ctx } = getCanvasContext(cursorCanvasRef);

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const drawAni = () => {
      const now = performance.now();

      if (now - drawTimeRef.current > 16 && pointsRef.current.length > 1) {
        if (pointsRef.current.length > CURSOR_LENGTH) pointsRef.current = pointsRef.current.slice(-CURSOR_LENGTH);
        drawTimeRef.current = now;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.globalAlpha = 0.3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = CURSOR_WIDTH;
        ctx.strokeStyle = 'white';

        const points = pointsRef.current;
        points.forEach((point, idx) => {
          if (idx === 0) ctx.moveTo(point.x, point.y);
          else if (idx < points.length - 1) {
            const midX = (points[idx + 1].x + point.x) / 2;
            const midY = (points[idx + 1].y + point.y) / 2;
            ctx.quadraticCurveTo(point.x, point.y, midX, midY);
          } else {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        });
      }

      if (now - deleteTimeRef.current > DELETE_INTERVAL && pointsRef.current.length > 1) {
        pointsRef.current.shift();
        deleteTimeRef.current = now;
      }

      requestAnimationFrame(drawAni);
    };

    cursorAnimation.current = requestAnimationFrame(drawAni);

    return () => {
      if (cursorAnimation.current) cancelAnimationFrame(cursorAnimation.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    currentTimestamp.current = performance.now();
    if (currentTimestamp.current - lastTimestamp.current < 16) return;
    lastTimestamp.current = currentTimestamp.current;

    const { canvas } = getCanvasContextOnly(cursorCanvasRef);
    const point = getDrawPoint(e, canvas);
    pointsRef.current.push(point);
  };

  const handleMouseLeave = () => {
    const { canvas, ctx } = getCanvasContext(cursorCanvasRef);
    pointsRef.current.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
