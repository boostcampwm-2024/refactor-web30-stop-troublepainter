import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { RouterProvider } from 'react-router-dom';
import App from '@/App.tsx';
import { router } from '@/routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <Suspense fallback={null}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </Suspense>
    </App>
  </StrictMode>,
);
