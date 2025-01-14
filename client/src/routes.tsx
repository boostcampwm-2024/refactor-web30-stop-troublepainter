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
          loader: async () => {
            const [lobbyPage, gameRoomPage, resultPage] = await Promise.all([
              import('@/pages/LobbyPage'),
              import('@/pages/GameRoomPage'),
              import('@/pages/ResultPage'),
            ]);

            return { lobbyPage, gameRoomPage, resultPage };
          },
          children: [
            {
              path: '/lobby/:roomId',
              element: <LobbyPage />,
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
    },
  },
);
