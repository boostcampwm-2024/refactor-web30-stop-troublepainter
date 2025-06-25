import { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, useRef } from 'react';
import { RoomStatus } from '@troublepainter/core';
import { Link } from 'react-router-dom';
import { Canvas } from '@/components/canvas/CanvasUI';
import { Logo } from '@/components/ui/Logo';
import { COLORS_INFO, MAINCANVAS_RESOLUTION_WIDTH } from '@/constants/canvasConstants';
import { handleInCanvas, handleOutCanvas } from '@/handlers/canvas/cursorInOutHandler';
import { useDrawing } from '@/hooks/canvas/useDrawing';
import { useCoordinateScale } from '@/hooks/useCoordinateScale';
import { CanvasEventHandlers } from '@/types/canvas.types';
import { getCanvasContext } from '@/utils/getCanvasContext';
import { getDrawPoint } from '@/utils/getDrawPoint';

const PlaygroundPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const { convertCoordinate } = useCoordinateScale(MAINCANVAS_RESOLUTION_WIDTH, canvasRef);

  const {
    currentColor,
    setCurrentColor,
    brushSize,
    setBrushSize,
    drawingMode,
    setDrawingMode,
    startDrawing,
    continueDrawing,
    stopDrawing,
    canRedo,
    inkRemaining,
    canUndo,
    undo,
    redo,
  } = useDrawing(canvasRef, RoomStatus.DRAWING, {
    maxPixels: Number.MAX_SAFE_INTEGER,
  });

  const colorsWithSelect = COLORS_INFO.map((color) => ({
    ...color,
    isSelected: currentColor === color.backgroundColor,
    onClick: () => setCurrentColor(color.backgroundColor),
  }));

  const handleDrawStart = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    const { canvas } = getCanvasContext(canvasRef);
    const point = getDrawPoint(e, canvas);
    const convertPoint = convertCoordinate(point);
    startDrawing(convertPoint);
  };

  const handleDrawMove = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    const { canvas } = getCanvasContext(canvasRef);
    const point = getDrawPoint(e, canvas);
    const convertPoint = convertCoordinate(point);

    handleInCanvas(cursorCanvasRef, convertPoint, brushSize);
    continueDrawing(convertPoint);
  };

  const handleDrawLeave = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    const { canvas } = getCanvasContext(canvasRef);
    const point = getDrawPoint(e, canvas);
    const convertPoint = convertCoordinate(point);

    continueDrawing(convertPoint);
    handleOutCanvas(cursorCanvasRef);
    stopDrawing();
  };

  const handleDrawEnd = () => {
    stopDrawing();
  };

  const canvasEventHandlers: CanvasEventHandlers = {
    onPointerDown: handleDrawStart,
    onPointerMove: handleDrawMove,
    onPointerUp: handleDrawEnd,
    onPointerLeave: handleDrawLeave,
    onPointerCancel: handleDrawEnd,
  };

  return (
    <div
      className={`relative flex min-h-screen flex-col justify-start bg-gradient-to-b from-violet-950 via-violet-800 to-fuchsia-800 before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-cover before:bg-center lg:py-5`}
    >
      <header className="z-10 flex h-20 items-center justify-center">
        <Link
          to={'/'}
          className="transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          <Logo variant="side" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <Canvas
          inkRemaining={inkRemaining}
          canvasRef={canvasRef}
          cursorCanvasRef={cursorCanvasRef}
          isDrawable={true}
          isHidden={false}
          colors={colorsWithSelect}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          drawingMode={drawingMode}
          onDrawingModeChange={setDrawingMode}
          maxPixels={Number.MAX_SAFE_INTEGER}
          canvasEvents={canvasEventHandlers}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          showInkRemaining={false}
        />
      </main>
    </div>
  );
};

export { PlaygroundPage };
