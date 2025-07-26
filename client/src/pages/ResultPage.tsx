import podium from '@/assets/podium.gif';
import PodiumPlayers from '@/components/result/PodiumPlayers';
import { useGameResult } from '@/hooks/game/useGameResult';

const ResultPage = () => {
  const { getRankedPlayers } = useGameResult();
  const { firstPlacePlayers, secondPlacePlayers, thirdPlacePlayers } = getRankedPlayers();

  return (
    <section className="relative">
      <img src={podium} alt="" aria-hidden={true} className="w-[25rem] sm:w-[33.75rem]" />
      <span className="absolute left-14 top-[25%] text-4xl text-stroke-md sm:left-12 sm:text-7xl sm:text-stroke-lg">
        GAME
      </span>
      <span className="absolute right-14 top-[25%] text-4xl text-stroke-md sm:right-12 sm:text-7xl sm:text-stroke-lg">
        ENDS
      </span>

      <PodiumPlayers players={firstPlacePlayers} position="first" />
      <PodiumPlayers players={secondPlacePlayers} position="second" />
      <PodiumPlayers players={thirdPlacePlayers} position="third" />
    </section>
  );
};

export default ResultPage;
