import { Modal } from '@/components/ui/Modal';
import { PLAYING_ROLE_TEXT } from '@/constants/gameConstant';
import { useRoleModal } from '@/hooks/game/useRoleModal';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

const RoleModal = () => {
  const { isModalOpened, closeModal, handleKeyDown } = useRoleModal();
  const roundAssignedRole = useGameSocketStore((state) => state.roundAssignedRole);

  return (
    <Modal
      title="역할 배정"
      isModalOpened={isModalOpened}
      closeModal={closeModal}
      handleKeyDown={handleKeyDown}
      className="w-80"
    >
      <span className="flex min-h-28 items-center justify-center text-3xl text-violet-950">
        {roundAssignedRole ? PLAYING_ROLE_TEXT[roundAssignedRole] : ''}
      </span>
    </Modal>
  );
};

export default RoleModal;
