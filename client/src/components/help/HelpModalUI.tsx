import HelpPage from './HelpModalPage';
import left from '@/assets/left.svg';
import right from '@/assets/right.svg';
import { Modal } from '@/components/ui/Modal';
import { HelpModalUIProps } from '@/types/help.types';

const HelpModalUI = ({
  isModalOpened,
  handleCloseModal,
  handleKeyDown,
  pageData,
  pageIndex,
  setPageIndex,
  pagenation,
  dotLottieRefCallback,
  handleTouchStart,
  handleTouchEnd,
  handleTouchMove,
  changePageIndex,
}: HelpModalUIProps) => {
  return (
    <Modal
      isModalOpened={isModalOpened}
      closeModal={handleCloseModal}
      handleKeyDown={handleKeyDown}
      className="w-full max-w-screen-md"
    >
      <section
        className="flex md:p-7"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button className="relative -left-6 hidden md:block" onClick={() => changePageIndex(true)}>
          <img src={left} width={30} alt="이전 페이지 버튼" className="transition hover:brightness-75" />
        </button>
        <HelpPage
          pageData={pageData[pageIndex]}
          isModalOpened
          dotLottieRefCallback={dotLottieRefCallback}
          pagenation={pagenation}
          setPageIndex={setPageIndex}
        />
        <button className="relative -right-6 hidden md:block" onClick={() => changePageIndex(false)}>
          <img src={right} width={30} alt="다음 페이지 버튼" className="transition hover:brightness-75" />
        </button>
      </section>
    </Modal>
  );
};

export default HelpModalUI;
