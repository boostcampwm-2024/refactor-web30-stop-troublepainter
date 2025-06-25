import { useEffect } from 'react';
import BackgroundContainer from '@/components/main/BackgroundCanvasContainer';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { PixelTransitionContainer } from '@/components/ui/PixelTransitionContainer';
import { useCreateRoom } from '@/hooks/useCreateRoom';
import { usePageTransition } from '@/hooks/usePageTransition';
import { cn } from '@/utils/cn';

const MainPage = () => {
  const { createRoom, isLoading } = useCreateRoom();
  const { isExiting, transitionTo } = usePageTransition();

  const preloadGamePage = async () => {
    await Promise.all([
      import('@/layouts/GameLayout'),
      import('@/pages/LobbyPage'),
      import('@/pages/GameRoomPage'),
      import('@/pages/ResultPage'),
    ]);
  };

  const preloadPaintBoardPage = async () => {
    await Promise.all([import('@/pages/PlaygroundPage')]);
  };

  useEffect(() => {
    // 현재 URL을 루트로 변경
    window.history.replaceState(null, '', '/');
  }, []);

  const handleCreateRoom = async () => {
    const response = await createRoom();
    if (response && response.roomId) {
      transitionTo(`/lobby/${response.roomId}`);
    }
  };

  const handleMoveToPlayground = () => transitionTo('/playground');

  return (
    <PixelTransitionContainer isExiting={isExiting}>
      <main
        className={cn(
          'relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 sm:gap-16',
          isExiting ? 'bg-transparent' : 'bg-gradient-to-b from-violet-950 via-violet-800 to-fuchsia-700',
        )}
      >
        <BackgroundContainer />

        <div className="-z-10 duration-1000 animate-in fade-in slide-in-from-top-8">
          <Logo variant="main" className="w-full transition duration-300 hover:scale-110 hover:brightness-[1.12]" />
        </div>

        <div className="-z-10 flex h-12 w-full flex-wrap items-center justify-center gap-6">
          <Button
            onClick={() => void handleCreateRoom()}
            disabled={isLoading || isExiting}
            className="h-full max-w-60 animate-pulse"
            onPointerEnter={() => void preloadGamePage()}
          >
            {isLoading || isExiting ? '방 생성중...' : '방 만들기'}
          </Button>
          <Button
            onClick={handleMoveToPlayground}
            disabled={isLoading || isExiting}
            className="h-full max-w-60 animate-pulse"
            onPointerEnter={() => void preloadPaintBoardPage()}
          >
            플레이그라운드
          </Button>
        </div>
      </main>
    </PixelTransitionContainer>
  );
};

export default MainPage;
