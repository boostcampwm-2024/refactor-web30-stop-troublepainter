import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { RouterProvider } from 'react-router-dom';
import { Loading } from './components/ui/Loading';
import App from '@/App.tsx';
import { router } from '@/routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </Suspense>
    </App>
  </StrictMode>,
);
