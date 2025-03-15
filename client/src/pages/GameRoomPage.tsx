import RoleModal from '@/components/modal/RoleModal';
import RoundEndModal from '@/components/modal/RoundEndModal';
import QuizStageContainer from '@/components/quiz/QuizStage';
import { usePageShortcutKeys } from '@/hooks/usePageShortcutKeys';

const GameRoomPage = () => {
  usePageShortcutKeys();

  return (
    <>
      <RoleModal />
      <RoundEndModal />
      <QuizStageContainer />
    </>
  );
};

export default GameRoomPage;
