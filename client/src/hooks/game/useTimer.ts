import { useEffect, useRef } from 'react';
import { TimerType } from '@troublepainter/core';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { useTimerStore } from '@/stores/timer.store';

/**
 * 게임 내 여러 단계별 타이머를 관리하는 커스텀 훅입니다.
 *
 * @remarks
 * - `timers` 상태를 감지하여 각 타이머 타입별로 인터벌을 설정하고 1초마다 감소시키는 동작을 수행합니다.
 * - 기존 인터벌은 중복 실행을 막기 위해 정리하며, 타이머 값이 0 이하이거나 null일 경우 인터벌을 제거합니다.
 * - `roomStatus`에 따라 현재 남은 시간을 반환하는 함수도 제공합니다.
 * - `drawTime`은 기본 드로잉 타이머 시간이며, 서버에서 받아온 설정값입니다.
 *
 * @returns
 * - `getRemainingTime`: 현재 라운드 상태에 따른 남은 시간을 반환하는 함수 (number)
 *
 * @example
 * ```tsx
 *
 * const TimerDisplay = () => {
 *   const { getRemainingTime } = useTimer();
 *
 *   useEffect(() => {
 *     const interval = setInterval(() => {
 *       console.log('남은 시간:', getRemainingTime());
 *     }, 1000);
 *
 *     return () => clearInterval(interval);
 *   }, [getRemainingTime]);
 *
 *   return <div>남은 시간: {getRemainingTime()}초</div>;
 * };
 * ```
 */

export const useTimer = () => {
  const actions = useTimerStore((state) => state.actions);
  const timers = useTimerStore((state) => state.timers);
  const roomStatus = useGameSocketStore((state) => state.room?.status);
  const drawTime = useGameSocketStore((state) => state.roomSettings?.drawTime);

  const intervalRefs = useRef<Record<TimerType, NodeJS.Timeout | null>>({
    [TimerType.DRAWING]: null,
    [TimerType.GUESSING]: null,
    [TimerType.ENDING]: null,
  });

  useEffect(() => {
    const manageTimer = (timerType: TimerType, value: number | null) => {
      // 이전 인터벌 정리
      if (intervalRefs.current[timerType]) {
        clearInterval(intervalRefs.current[timerType]!);
        intervalRefs.current[timerType] = null;
      }

      // 새로운 타이머 설정
      if (value !== null && value > 0) {
        intervalRefs.current[timerType] = setInterval(() => {
          actions.decreaseTimer(timerType);
        }, 1000);
      }
    };

    // 각 타이머 타입에 대해 처리
    Object.entries(timers).forEach(([type, value]) => {
      if (type in TimerType) {
        manageTimer(type as TimerType, value);
      }
    });

    // 클린업
    return () => {
      Object.values(intervalRefs.current).forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, [
    timers.DRAWING !== null && timers.DRAWING > 0,
    timers.GUESSING !== null && timers.GUESSING > 0,
    timers.ENDING !== null && timers.ENDING > 0,
    actions,
  ]); // timers와 actions만 의존성으로 설정

  const getRemainingTime = () => {
    switch (roomStatus) {
      case 'DRAWING':
        return timers.DRAWING ?? drawTime;
      case 'GUESSING':
        return timers.GUESSING ?? 15;
      default:
        return 0;
    }
  };

  return {
    getRemainingTime,
  };
};
