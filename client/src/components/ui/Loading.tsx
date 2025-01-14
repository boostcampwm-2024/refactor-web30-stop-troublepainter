import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import loading from '@/assets/lottie/loading.lottie';

export const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <DotLottieReact src={loading} loop autoplay className="h-96 w-96" />
    </div>
  );
};
