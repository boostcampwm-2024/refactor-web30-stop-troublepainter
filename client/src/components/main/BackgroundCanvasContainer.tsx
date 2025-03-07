import BackgroundCanvasUI from './BackgroundCanvasUI';
import BackgroundImage from '@/components/main/BackgroundImage';
import useBackgroundCanvas from '@/hooks/useBackgroundCanvas';

const BackgroundContainer = () => {
  const { cursorCanvasRef, handleMouseLeave, handleMouseMove } = useBackgroundCanvas();

  return (
    <>
      <BackgroundImage className="-z-30" />
      <BackgroundCanvasUI
        className="pointer-events-auto absolute inset-0 -z-20"
        cursorCanvasRef={cursorCanvasRef}
        handleMouseLeave={handleMouseLeave}
        handleMouseMove={handleMouseMove}
      />
    </>
  );
};

export default BackgroundContainer;
