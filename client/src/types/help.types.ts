import { KeyboardEvent } from 'react';

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
