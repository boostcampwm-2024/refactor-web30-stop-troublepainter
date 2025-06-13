import { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, useRef } from 'react';
import { RoomStatus } from '@troublepainter/core';
import { Canvas } from '@/components/canvas/CanvasUI';
import { COLORS_INFO, DEFAULT_MAX_PIXELS, MAINCANVAS_RESOLUTION_WIDTH } from '@/constants/canvasConstants';
import { handleInCanvas, handleOutCanvas } from '@/handlers/canvas/cursorInOutHandler';
import { drawingSocketHandlers } from '@/handlers/socket/drawingSocket.handler';
import { useDrawing } from '@/hooks/canvas/useDrawing';
import { useDrawingSocket } from '@/hooks/socket/useDrawingSocket';
import { useCoordinateScale } from '@/hooks/useCoordinateScale';
import { CanvasEventHandlers } from '@/types/canvas.types';
import { getCanvasContext } from '@/utils/getCanvasContext';
import { getDrawPoint } from '@/utils/getDrawPoint';

const PaintBoardPage = () => {
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
    applyDrawing,
    continueDrawing,
    stopDrawing,
    canRedo,
    inkRemaining,
    canUndo,
    undo,
    redo,
  } = useDrawing(canvasRef, RoomStatus.DRAWING, {
    maxPixels: DEFAULT_MAX_PIXELS,
  });

  const { isConnected } = useDrawingSocket({
    onDrawUpdate: (response) => {
      if (response) {
        applyDrawing(response.drawingData);
      }
    },
    onSubmitRequest: () => {},
  });

  const colorsWithSelect = COLORS_INFO.map((color) => ({
    ...color,
    isSelected: currentColor === color.backgroundColor,
    onClick: () => setCurrentColor(color.backgroundColor),
  }));

  const handleDrawStart = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    if (!isConnected) return;

    const { canvas } = getCanvasContext(canvasRef);
    const point = getDrawPoint(e, canvas);
    const convertPoint = convertCoordinate(point);

    const drawingData = startDrawing(convertPoint);
    if (drawingData) {
      void drawingSocketHandlers.sendDrawing(drawingData);
    }
  };

  const handleDrawMove = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    const { canvas } = getCanvasContext(canvasRef);
    const point = getDrawPoint(e, canvas);
    const convertPoint = convertCoordinate(point);

    handleInCanvas(cursorCanvasRef, convertPoint, brushSize);

    const drawingData = continueDrawing(convertPoint);
    if (drawingData) {
      void drawingSocketHandlers.sendDrawing(drawingData);
    }
  };

  const handleDrawLeave = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    const { canvas } = getCanvasContext(canvasRef);
    const point = getDrawPoint(e, canvas);
    const convertPoint = convertCoordinate(point);

    const drawingData = continueDrawing(convertPoint);
    if (drawingData) {
      void drawingSocketHandlers.sendDrawing(drawingData);
    }

    handleOutCanvas(cursorCanvasRef);
    stopDrawing();
  };

  const handleDrawEnd = () => {
    stopDrawing();
  };

  const handleUndo = () => {
    if (!isConnected) return;
    const updates = undo();
    if (!updates) return;
    updates.forEach((update) => {
      void drawingSocketHandlers.sendDrawing(update);
    });
  };

  const handleRedo = () => {
    if (!isConnected) return;
    const updates = redo();
    if (!updates) return;
    updates.forEach((update) => {
      void drawingSocketHandlers.sendDrawing(update);
    });
  };

  const canvasEventHandlers: CanvasEventHandlers = {
    onPointerDown: handleDrawStart,
    onPointerMove: handleDrawMove,
    onPointerUp: handleDrawEnd,
    onPointerLeave: handleDrawLeave,
    onPointerCancel: handleDrawEnd,
  };

  return (
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
      maxPixels={DEFAULT_MAX_PIXELS}
      canvasEvents={canvasEventHandlers}
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={handleUndo}
      onRedo={handleRedo}
    />
  );
};

export { PaintBoardPage };
