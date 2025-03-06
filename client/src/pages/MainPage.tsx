import { useEffect } from 'react';
import BackgroundCanvas from '@/components/main/BackgroundCanvasUI';
import BackgroundImage from '@/components/main/BackgroundImage';
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

  useEffect(() => {
    // 현재 URL을 루트로 변경
    window.history.replaceState(null, '', '/');
  }, []);

  const handleCreateRoom = async () => {
    // transitionTo(`/lobby/${roomId}`);
    const response = await createRoom();
    if (response && response.roomId) {
      transitionTo(`/lobby/${response.roomId}`);
    }
  };

  return (
    <PixelTransitionContainer isExiting={isExiting}>
      <main
        className={cn(
          'relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 sm:gap-16',
          isExiting ? 'bg-transparent' : 'bg-gradient-to-b from-violet-950 via-violet-800 to-fuchsia-700',
        )}
      >
        <BackgroundImage className="-z-30" />
        <BackgroundCanvas className="pointer-events-auto absolute inset-0 -z-20" />

        <div className="-z-10 duration-1000 animate-in fade-in slide-in-from-top-8">
          <Logo variant="main" className="w-full transition duration-300 hover:scale-110 hover:brightness-[1.12]" />
        </div>

        <Button
          onClick={() => void handleCreateRoom()}
          disabled={isLoading || isExiting}
          className="-z-10 h-12 max-w-72 animate-pulse"
          onPointerEnter={() => void preloadGamePage()}
        >
          {isLoading || isExiting ? '방 생성중...' : '방 만들기'}
        </Button>
      </main>
    </PixelTransitionContainer>
  );
};

export default MainPage;
