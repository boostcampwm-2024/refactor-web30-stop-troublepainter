import HelpModalUI from './HelpModalUI';
import useHelpModal from '@/hooks/useHelpModal';
import { HelpModalContainerProps } from '@/types/help.types';

const HelpModalContainer = ({ isModalOpened, handleCloseModal, handleKeyDown }: HelpModalContainerProps) => {
  const {
    pageData,
    pageIndex,
    setPageIndex,
    pagenation,
    dotLottieRefCallback,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    changePageIndex,
  } = useHelpModal(isModalOpened);
  return (
    <HelpModalUI
      isModalOpened={isModalOpened}
      handleCloseModal={handleCloseModal}
      handleKeyDown={handleKeyDown}
      pageData={pageData}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      pagenation={pagenation}
      dotLottieRefCallback={dotLottieRefCallback}
      handleTouchStart={handleTouchStart}
      handleTouchEnd={handleTouchEnd}
      handleTouchMove={handleTouchMove}
      changePageIndex={changePageIndex}
    />
  );
};

export default HelpModalContainer;
