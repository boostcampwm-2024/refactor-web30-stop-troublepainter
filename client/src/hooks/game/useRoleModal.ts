import { useEffect } from 'react';
import { useModal } from '../useModal';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';

/**
 * 역할 모달의 열림 상태와 동작을 관리하는 커스텀 훅입니다.
 *
 * @remarks
 * - `currentRound`가 변경될 때마다 역할 모달을 자동으로 엽니다.
 * - 내부적으로 `useModal` 훅을 사용하여 모달 열림 상태, 닫기 함수, 키다운 이벤트 핸들러, 모달 열기 함수를 제공합니다.
 * - `DRAWING_TIME`으로 지정된 시간(5초) 동안 모달이 자동으로 닫힐 수 있도록 설정되어 있습니다.
 *
 * @returns
 * - `isModalOpened`: 모달 열림 상태 (boolean)
 * - `closeModal`: 모달을 닫는 함수
 * - `handleKeyDown`: 모달 내 키다운 이벤트 핸들러 함수
 * - `openModal`: 모달을 여는 함수
 *
 * @example
 * ```tsx
 * const RoleModalComponent = () => {
 *   const { isModalOpened, closeModal, handleKeyDown } = useRoleModal();
 *
 *   if (!isModalOpened) return null;
 *
 *   return (
 *     <div tabIndex={0} onKeyDown={handleKeyDown}>
 *       <p>역할 안내 모달</p>
 *       <button onClick={closeModal}>닫기</button>
 *     </div>
 *   );
 * };
 * ```
 */

const DRAWING_TIME = 5000;

export const useRoleModal = () => {
  const currentRound = useGameSocketStore((state) => state.room?.currentRound);
  const { isModalOpened, closeModal, handleKeyDown, openModal } = useModal(DRAWING_TIME);

  useEffect(() => {
    openModal();
  }, [currentRound]);

  return { isModalOpened, closeModal, handleKeyDown, openModal };
};
