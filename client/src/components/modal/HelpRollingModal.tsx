import { useEffect, useState, TouchEvent, useRef } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-react';
import HelpPage from '../ui/HelpPage';
import left from '@/assets/left.svg';
import fifth from '@/assets/lottie/help/fifth.lottie';
import first from '@/assets/lottie/help/first.lottie';
import fourth from '@/assets/lottie/help/fourth.lottie';
import second from '@/assets/lottie/help/second.lottie';
import third from '@/assets/lottie/help/third.lottie';
import right from '@/assets/right.svg';
import { Modal } from '@/components/ui/Modal';
import { HelpRollingModalProps, PageData } from '@/types/help.types';

const pageData: PageData[] = [
  {
    img: first,
    contents: ['게임을 함께 할 친구를 모으세요.', '그리고 게임 시작을 누르세요.'],
    cache: null,
  },
  {
    img: second,
    contents: ['그림꾼은 제시어를 표현하세요.', '방해꾼은 그림꾼을 방해하세요.'],
    cache: null,
  },
  {
    img: third,
    contents: [
      '구경꾼은 타이머 종료 후 제시어를 맞추세요.',
      '정답이면 맞춘 구경꾼과 그림꾼이 점수를 얻고,',
      '오답이면 방해꾼이 점수를 얻어요.',
    ],
    cache: null,
  },
  {
    img: fourth,
    contents: ['설정한 라운드 수 만큼 게임을 즐기세요.', '매 라운드 마다 역할이 바뀌어요.'],
    cache: null,
  },
  {
    img: fifth,
    contents: ['시상대에서 승리의 기쁨을 누리세요.', '1등이 아니라면 다음 게임을 노려보세요.'],
    cache: null,
  },
];

const HelpRollingModal = ({ isModalOpened, handleCloseModal, handleKeyDown }: HelpRollingModalProps) => {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pagenation, setPagenation] = useState(new Array(pageData.length).fill(false));
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);

  const startPos = useRef<number>(0);
  const canDrag = useRef<boolean>(true);

  useEffect(() => {
    const newPageState = new Array(pageData.length).fill(false);
    newPageState[pageIndex] = true;
    setPagenation(newPageState);
  }, [pageIndex]);

  useEffect(() => {
    if (!dotLottie) return;
    if (isModalOpened) dotLottie.play();
    else dotLottie.stop();
  }, [isModalOpened]);

  const dotLottieRefCallback = (dotLottie: DotLottie) => {
    setDotLottie(dotLottie);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const clientX = e.touches[0].clientX;
    startPos.current = clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!canDrag.current) return;

    const clientX = e.touches[0].clientX;
    if (Math.abs(startPos.current - clientX) < 50) return;

    if (dotLottie) dotLottie.stop();
    canDrag.current = false;
    startPos.current = clientX;

    if (clientX - startPos.current > 0) setPageIndex(pageIndex == 0 ? pageData.length - 1 : pageIndex - 1);
    else setPageIndex(pageIndex == pageData.length - 1 ? 0 : pageIndex + 1);
  };

  const handleTouchEnd = () => {
    canDrag.current = true;
  };

  return (
    <Modal
      isModalOpened={isModalOpened}
      closeModal={handleCloseModal}
      handleKeyDown={handleKeyDown}
      className="w-full max-w-screen-md"
    >
      <section
        className="flex md:p-7"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="relative -left-6 hidden md:block"
          onClick={() => {
            setPageIndex(pageIndex == 0 ? pageData.length - 1 : pageIndex - 1);
          }}
        >
          <img src={left} width={30} alt="이전 페이지 버튼" className="transition hover:brightness-75" />
        </button>
        <HelpPage
          pageData={pageData[pageIndex]}
          isModalOpened
          dotLottieRefCallback={dotLottieRefCallback}
          pagenation={pagenation}
          setPageIndex={setPageIndex}
        />
        <button
          className="relative -right-6 hidden md:block"
          onClick={() => {
            if (dotLottie) dotLottie.stop();
            setPageIndex(pageIndex == pageData.length - 1 ? 0 : pageIndex + 1);
          }}
        >
          <img src={right} width={30} alt="다음 페이지 버튼" className="transition hover:brightness-75" />
        </button>
      </section>
    </Modal>
  );
};

export default HelpRollingModal;
