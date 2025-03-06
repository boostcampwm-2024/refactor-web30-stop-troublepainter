import { lazy, MouseEvent, Suspense, useState } from 'react';
import helpIcon from '@/assets/help-icon.svg';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/hooks/useModal';

const HelpRollingModal = lazy(() => import('@/components/help/HelpModalUI'));

const HelpContainer = () => {
  const { isModalOpened, closeModal, openModal, handleKeyDown } = useModal();
  const [shouldLoadModal, setShouldLoadModal] = useState(false);

  const handleOpenHelpModal = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    openModal();
  };

  const handleMouseEnter = () => {
    setShouldLoadModal(true);
  };

  return (
    <section className="fixed right-4 top-4 z-30 xs:right-8 xs:top-8">
      <Button
        variant="transperent"
        size="icon"
        onClick={handleOpenHelpModal}
        onPointerEnter={handleMouseEnter}
        aria-label="도움말 보기"
        className="hover:brightness-75"
      >
        <img src={helpIcon} alt="도움말 보기 버튼" />
      </Button>

      {shouldLoadModal && (
        <Suspense fallback={null}>
          <HelpRollingModal isModalOpened={isModalOpened} handleCloseModal={closeModal} handleKeyDown={handleKeyDown} />
        </Suspense>
      )}
    </section>
  );
};

export default HelpContainer;
