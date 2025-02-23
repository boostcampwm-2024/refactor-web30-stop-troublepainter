import { KeyboardEvent } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-react';

export interface PageData {
  img: string;
  contents: string[];
  cache: string | null;
}

export interface HelpRollingModalProps {
  isModalOpened: boolean;
  handleCloseModal: () => void;
  handleKeyDown: (e: KeyboardEvent<Element>) => void;
}

export interface HelpPageProps {
  pageData: PageData;
  isModalOpened: boolean;
  dotLottieRefCallback: (dot: DotLottie) => void;
  pagenation: boolean[];
  setPageIndex: (index: number) => void;
}
