import useBackgroundCanvas from './useBackgroundCanvas';

const Background = ({ className }: { className: string }) => {
  const { cursorCanvasRef, handleMouseLeave, handleMouseMove } = useBackgroundCanvas();

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
