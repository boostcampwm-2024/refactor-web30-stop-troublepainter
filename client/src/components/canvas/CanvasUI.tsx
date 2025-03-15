import { forwardRef, HTMLAttributes, RefObject, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import bucketIcon from '@/assets/bucket-icon.svg';
import penIcon from '@/assets/pen-icon.svg';
import redoIcon from '@/assets/redo-icon.svg';
import { InkGauge } from '@/components/canvas/InkGauge';
import { Button } from '@/components/ui/Button';
import {
  DRAWING_MODE,
  LINEWIDTH_VARIABLE,
  MAINCANVAS_RESOLUTION_HEIGHT,
  MAINCANVAS_RESOLUTION_WIDTH,
} from '@/constants/canvasConstants';
import { SHORTCUT_KEYS } from '@/constants/shortcutKeys';
import { CanvasEventHandlers, Color, DrawingMode } from '@/types/canvas.types';
import { ShortcutKey } from '@/types/shorcut.types';
import { cn } from '@/utils/cn';
import { shortcutManager } from '@/utils/shortcutManager';

const toolbarVariants = cva('flex items-center justify-center gap-3 border-violet-950 bg-eastbay-400 p-2', {
  variants: {
    position: {
      bottom: 'mt-auto sm:rounded-b',
      floating: 'absolute bottom-4 left-1/2 w-11/12 -translate-x-1/2 rounded-xl border-2',
    },
  },
  defaultVariants: {
    position: 'bottom',
  },
});

const colorButtonVariants = cva(
  'h-8 w-8 rounded-full border-2 border-violet-950 transition-transform hover:scale-110 focus:scale-110 focus:shadow-md active:scale-95 active:shadow-md',
  {
    variants: {
      isSelected: {
        true: 'ring-2 ring-violet-500 ring-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      isSelected: false,
    },
  },
);

const controlButtonVariants = cva(
  'w-8 h-8 flex items-center justify-center bg-eastbay-400 transition rounded-full border-none hover:brightness-90 active:brightness-80',
  {
    variants: {
      isDisabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const modeButtonVariants = cva(
  'h-9 w-9 rounded-lg border-2 border-violet-950 transition-all hover:scale-110 focus:scale-110 focus:shadow-md active:scale-95',
  {
    variants: {
      isSelected: {
        true: 'bg-violet-500 brigntness-110',
        false: 'bg-violet-950 brightness-75',
      },
    },
    defaultVariants: {
      isSelected: false,
    },
  },
);

interface ColorButton {
  color: Color;
  backgroundColor: string;
  isSelected: boolean;
  onClick: () => void;
}

interface CanvasProps extends HTMLAttributes<HTMLDivElement> {
  canvasRef: RefObject<HTMLCanvasElement>;
  cursorCanvasRef: RefObject<HTMLCanvasElement>;
  isDrawable: boolean;
  colors: ColorButton[];
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  toolbarPosition?: VariantProps<typeof toolbarVariants>['position'];
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
  inkRemaining: number;
  maxPixels: number;
  canvasEvents: CanvasEventHandlers;
  isHidden: boolean;
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      className,
      canvasRef,
      cursorCanvasRef,
      isDrawable = true,
      colors = [],
      onUndo,
      onRedo,
      setBrushSize,
      canUndo = false,
      canRedo = false,
      brushSize = LINEWIDTH_VARIABLE.MIN_WIDTH,
      toolbarPosition = 'bottom',
      drawingMode = 'pen',
      onDrawingModeChange,
      inkRemaining,
      maxPixels,
      canvasEvents,
      isHidden,
      ...props
    },
    ref,
  ) => {
    const { registerShortcut, unregisterShortcut } = shortcutManager();

    const colorShortKeyMap: Record<Color, ShortcutKey> = {
      검정: SHORTCUT_KEYS.BLACK_COLOR.key,
      노랑: SHORTCUT_KEYS.YELLOW_COLOR.key,
      분홍: SHORTCUT_KEYS.PINK_COLOR.key,
      하늘: SHORTCUT_KEYS.BLUE_COLOR.key,
      회색: SHORTCUT_KEYS.GRAY_COLOR.key,
    };

    useEffect(() => {
      registerShortcut(SHORTCUT_KEYS.PEN.key, () => onDrawingModeChange(DRAWING_MODE.PEN));
      registerShortcut(SHORTCUT_KEYS.FILL.key, () => onDrawingModeChange(DRAWING_MODE.FILL));
      registerShortcut(SHORTCUT_KEYS.UNDO.key, () => onUndo());
      registerShortcut(SHORTCUT_KEYS.REDO.key, () => onRedo());
      colors.forEach((color) => registerShortcut(colorShortKeyMap[color.color], () => color.onClick()));

      return () => {
        unregisterShortcut(SHORTCUT_KEYS.PEN.key);
        unregisterShortcut(SHORTCUT_KEYS.FILL.key);
        unregisterShortcut(SHORTCUT_KEYS.UNDO.key);
        unregisterShortcut(SHORTCUT_KEYS.REDO.key);
        colors.forEach((color) => unregisterShortcut(colorShortKeyMap[color.color]));
      };
    }, [onUndo, onRedo]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full max-w-screen-sm flex-col border-violet-500 bg-white',
          'sm:rounded-lg sm:border-4 sm:shadow-xl',
          isHidden && 'hidden',
          className,
        )}
        {...props}
      >
        <div className="relative aspect-[16/10]">
          <canvas
            ref={canvasRef}
            width={MAINCANVAS_RESOLUTION_WIDTH}
            height={MAINCANVAS_RESOLUTION_HEIGHT}
            className={cn(
              'absolute left-0 top-0 h-full w-full object-contain',
              isDrawable ? 'touch-none' : 'pointer-events-none',
            )}
            aria-label={isDrawable ? '그림판' : '그림 보기'}
          />
          <canvas
            ref={cursorCanvasRef}
            width={MAINCANVAS_RESOLUTION_WIDTH}
            height={MAINCANVAS_RESOLUTION_HEIGHT}
            className={cn(
              'absolute left-0 top-0 h-full w-full cursor-none object-contain',
              isDrawable ? 'touch-none' : 'pointer-events-none',
            )}
            aria-label={isDrawable ? '그림판' : '그림 보기'}
            {...canvasEvents}
          />
          {isDrawable && (
            <div className={cn('absolute bottom-1 right-1')}>
              <InkGauge remainingPixels={inkRemaining} maxPixels={maxPixels} />
            </div>
          )}
        </div>

        {isDrawable && colors.length > 0 && (
          <>
            <div
              className={cn(
                toolbarVariants({ position: toolbarPosition }),
                `${drawingMode === DRAWING_MODE.FILL && 'w-auto'}`,
              )}
            >
              <div className="flex gap-1.5">
                {colors.map((color, index) => (
                  <Button
                    key={index}
                    className={cn(colorButtonVariants({ isSelected: color.isSelected }))}
                    style={{ backgroundColor: color.backgroundColor }}
                    size="icon"
                    onClick={color.onClick}
                    aria-label={`${color.color} 색상 선택`}
                    aria-pressed={color.isSelected}
                  />
                ))}
              </div>

              {drawingMode === DRAWING_MODE.PEN && (
                <div className="flex-1">
                  <input
                    type="range"
                    min={LINEWIDTH_VARIABLE.MIN_WIDTH}
                    max={LINEWIDTH_VARIABLE.MAX_WIDTH}
                    step={LINEWIDTH_VARIABLE.STEP_WIDTH}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="h-2 w-full appearance-none rounded-full bg-violet-200"
                    aria-label="선 굵기 조절"
                  />
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Button
                  size="icon"
                  variant="transperent"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={cn(controlButtonVariants({ isDisabled: !canUndo }), '-scale-x-100')}
                  aria-label="되돌리기"
                >
                  <img src={redoIcon} alt="되돌리기 아이콘" />
                </Button>
                <Button
                  size="icon"
                  variant="transperent"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className={cn(controlButtonVariants({ isDisabled: !canRedo }))}
                  aria-label="다시실행"
                >
                  <img src={redoIcon} alt="다시실행 아이콘" />
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="icon"
                  variant="transperent"
                  className={cn(modeButtonVariants({ isSelected: drawingMode === DRAWING_MODE.PEN }))}
                  onClick={() => onDrawingModeChange(DRAWING_MODE.PEN)}
                  aria-label="펜 모드"
                  aria-pressed={drawingMode === DRAWING_MODE.PEN}
                >
                  <img src={penIcon} alt="펜 모드 아이콘" className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="transperent"
                  className={cn(modeButtonVariants({ isSelected: drawingMode === DRAWING_MODE.FILL }))}
                  onClick={() => onDrawingModeChange(DRAWING_MODE.FILL)}
                  aria-label="채우기 모드"
                  aria-pressed={drawingMode === DRAWING_MODE.FILL}
                >
                  <img src={bucketIcon} alt="채우기 모드 아이콘" className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  },
);

Canvas.displayName = 'Canvas';

export {
  Canvas,
  type CanvasProps,
  type DrawingMode,
  toolbarVariants,
  colorButtonVariants,
  controlButtonVariants,
  modeButtonVariants,
};
