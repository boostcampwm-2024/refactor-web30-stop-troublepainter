import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Layouts
const RootLayout = lazy(() => import('@/layouts/RootLayout'));
const GameLayout = lazy(() => import('@/layouts/GameLayout'));

// Pages
const MainPage = lazy(() => import('@/pages/MainPage'));
const LobbyPage = lazy(() => import('@/pages/LobbyPage'));
const GameRoomPage = lazy(() => import('@/pages/GameRoomPage'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        {
          path: '/',
          element: <MainPage />,
        },
        {
          element: <GameLayout />,
          children: [
            {
              path: '/lobby/:roomId',
              element: <LobbyPage />,
              loader: async () => {
                await Promise.all([
                  import('@/layouts/RootLayout'),
                  import('@/layouts/GameLayout'),
                  import('@/pages/LobbyPage'),
                ]);
                void Promise.all([import('@/pages/GameRoomPage'), import('@/pages/ResultPage')]);
                return null;
              },
            },
            {
              path: '/game/:roomId',
              element: <GameRoomPage />,
            },
            {
              path: '/game/:roomId/result',
              element: <ResultPage />,
            },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);
