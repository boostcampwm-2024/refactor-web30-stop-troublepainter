import BackgroundCanvasUI from './BackgroundCanvasUI';
import BackgroundImage from '@/components/main/BackgroundImage';
import useBackgroundCanvas from '@/hooks/useBackgroundCanvas';

const BackgroundContainer = ({ className }: { className: string }) => {
  const { cursorCanvasRef, handleMouseLeave, handleMouseMove } = useBackgroundCanvas();

  return (
    <>
      <BackgroundImage className="-z-30" />
      <BackgroundCanvasUI
        className={className}
        cursorCanvasRef={cursorCanvasRef}
        handleMouseLeave={handleMouseLeave}
        handleMouseMove={handleMouseMove}
      />
    </>
  );
};

export default BackgroundContainer;
