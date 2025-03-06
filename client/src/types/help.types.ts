import { KeyboardEvent, RefObject, MouseEvent, TouchEvent } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-react';

export interface PageData {
  img: string;
  contents: string[];
  cache: string | null;
}

export interface HelpModalContainerProps {
  isModalOpened: boolean;
  handleCloseModal: () => void;
  handleKeyDown: (e: KeyboardEvent<Element>) => void;
}

export interface HelpModalUIProps {
  isModalOpened: boolean;
  handleCloseModal: () => void;
  handleKeyDown: (e: KeyboardEvent<Element>) => void;
  pageData: PageData[];
  pageIndex: number;
  setPageIndex: (index: number) => void;
  pagenation: boolean[];
  dotLottieRefCallback: (dot: DotLottie) => void;
  handleTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: () => void;
  handleTouchMove: (e: TouchEvent<HTMLDivElement>) => void;
  changePageIndex: (rightDir: boolean) => void;
}

export interface HelpPageProps {
  pageData: PageData;
  isModalOpened: boolean;
  dotLottieRefCallback: (dot: DotLottie) => void;
  pagenation: boolean[];
  setPageIndex: (index: number) => void;
}

export interface IndicatorProps {
  pageData: PageData;
  pagenation: boolean[];
  setPageIndex: (index: number) => void;
}

export interface BackgroundCanvasUIProps {
  className: string;
  cursorCanvasRef: RefObject<HTMLCanvasElement>;
  handleMouseLeave: () => void;
  handleMouseMove: (e: MouseEvent<HTMLCanvasElement>) => void;
}
