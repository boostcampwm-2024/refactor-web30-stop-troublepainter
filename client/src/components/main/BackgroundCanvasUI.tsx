import { BackgroundCanvasUIProps } from '@/types/help.types';

const BackgroundCanvasUI = ({
  className,
  cursorCanvasRef,
  handleMouseLeave,
  handleMouseMove,
}: BackgroundCanvasUIProps) => {
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

export default BackgroundCanvasUI;
