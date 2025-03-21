import HelpModalUI from './HelpModalUI';
import useHelpModal from '@/hooks/useHelpModal';
import { HelpModalContainerProps } from '@/types/help.types';

const HelpModalContainer = ({ isModalOpened, handleCloseModal, handleKeyDown }: HelpModalContainerProps) => {
  const helpModalProps = useHelpModal(isModalOpened);
  return (
    <HelpModalUI
      {...helpModalProps}
      isModalOpened={isModalOpened}
      handleCloseModal={handleCloseModal}
      handleKeyDown={handleKeyDown}
    />
  );
};

export default HelpModalContainer;
