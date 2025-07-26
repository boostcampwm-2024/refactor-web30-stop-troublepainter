import { useCallback, useEffect, useState } from 'react';
import { RoomSettings } from '@troublepainter/core';
import { gameSocketHandlers } from '@/handlers/socket/gameSocket.handler';
import { useGameSocketStore } from '@/stores/socket/gameSocket.store';
import { useToastStore } from '@/stores/toast.store';
import { WordsThemeValidationMessage } from '@/types/wordsTheme.types';
import { validateWordsTheme } from '@/utils/wordsThemeValidation';

/**
 * 게임 설정 관련 상태와 동작을 제공하는 커스텀 훅입니다.
 *
 * @remarks
 * 이 훅은 게임 방의 설정 정보를 관리하며, 다음과 같은 기능을 포함합니다:
 * - 방 설정 값(라운드 수, 최대 플레이어 수, 제한 시간 등)의 상태 관리 및 업데이트
 * - 제시어 테마(wordsTheme)의 입력 검증 및 제출 처리
 * - 호스트 권한 여부에 따른 설정 편집 가능 여부 확인
 * - 서버와의 설정 동기화 및 상태 관리(store) 업데이트
 * - 설정 변경 시 토스트 메시지로 사용자 피드백 제공
 *
 * 내부적으로 React 상태 관리(`useState`, `useEffect`), 콜백(`useCallback`),
 * Zustand 기반의 전역 상태 관리, 그리고 비동기 설정 업데이트 핸들러를 사용합니다.
 *
/**
 * @returns 게임 설정 관련 상태와 동작을 포함하는 객체:
 * - `changeTheme`: 제시어 테마 입력 변경 핸들러입니다. (`e: React.ChangeEvent<HTMLInputElement>`) => void
 * - `submitTheme`: 제시어 테마를 제출하는 함수입니다. (`e: React.FormEvent<HTMLFormElement>, onSuccess: () => void`) => Promise<void>
 * - `isThemeSubmitDisabled`: 테마 제출 버튼이 비활성화되어야 하는지를 나타내는 불리언 값입니다.
 * - `wordsTheme`: 현재 입력된 제시어 테마 문자열입니다.
 * - `isThemeSubmitting`: 테마가 제출 중인지 여부를 나타내는 상태 값입니다.
 * - `themeValidationMessages`: 테마 입력에 대한 검증 메시지 리스트입니다.
 * - `updateSetting`: 게임 설정 값을 변경하는 함수입니다. (`key: keyof RoomSettings`, `value: string`) => void
 * - `checkCanSettingEdit`: 현재 사용자가 설정을 편집할 수 있는 권한이 있는지를 반환하는 함수입니다.
 * - `selectedValues`: 현재 선택된 게임 설정 값(RoomSettings)입니다.
 *
 *
 * @example
 * ```tsx
 * const {
 *   changeTheme,
 *   submitTheme,
 *   isThemeSubmitDisabled,
 *   wordsTheme,
 *   themeValidationMessages,
 *   updateSetting,
 *   checkCanSettingEdit,
 *   selectedValues,
 * } = useGameSetting();
 *
 * return (
 *   <form onSubmit={(e) => submitTheme(e, () => console.log('테마 제출 성공'))}>
 *     <input
 *       type="text"
 *       value={wordsTheme}
 *       onChange={changeTheme}
 *       disabled={!checkCanSettingEdit()}
 *     />
 *     {themeValidationMessages.map((msg, i) => (
 *       <p key={i} style={{ color: msg.type === 'error' ? 'red' : 'orange' }}>
 *         {msg.message}
 *       </p>
 *     ))}
 *     <button type="submit" disabled={isThemeSubmitDisabled}>
 *       테마 제출
 *     </button>
 *
 *     <label>
 *       라운드 수:
 *       <input
 *         type="number"
 *         value={selectedValues.totalRounds}
 *         onChange={(e) => updateSetting('totalRounds', e.target.value)}
 *         disabled={!checkCanSettingEdit()}
 *       />
 *     </label>
 *   </form>
 * );
 * ```
 */

export const useGameSetting = () => {
  const addToast = useToastStore((state) => state.actions.addToast);
  const actions = useGameSocketStore((state) => state.actions);
  const roomSettings = useGameSocketStore((state) => state.roomSettings);
  const isHost = useGameSocketStore((state) => state.isHost);

  const [wordsTheme, setWordsTheme] = useState(roomSettings?.wordsTheme || '');
  const [themeValidationMessages, setThemeValidationMessages] = useState<WordsThemeValidationMessage[]>([]);
  const [isThemeSubmitting, setIsThemeSubmitting] = useState(false);

  const [selectedValues, setSelectedValues] = useState<RoomSettings>(
    roomSettings ?? {
      totalRounds: 5,
      maxPlayers: 5,
      drawTime: 30,
    },
  );

  useEffect(() => {
    if (!roomSettings) return;
    setSelectedValues(roomSettings);
  }, [roomSettings]);

  const updateSetting = useCallback(
    (key: keyof RoomSettings, value: string) => {
      const newSettings = {
        ...selectedValues,
        [key]: Number(value),
      };
      setSelectedValues(newSettings);
      void gameSocketHandlers.updateSettings({
        settings: { ...newSettings, drawTime: newSettings.drawTime + 5 },
      });
      actions.updateRoomSettings(newSettings);
    },
    [selectedValues],
  );

  useEffect(() => {
    setWordsTheme(roomSettings?.wordsTheme || '');
  }, [roomSettings?.wordsTheme]);

  const checkCanSettingEdit = () => isHost;

  // 실시간 입력 검증
  const changeTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, ' ');
    setWordsTheme(value);
    setThemeValidationMessages(validateWordsTheme(value));
  };

  const submitTheme = async (e: React.FormEvent<HTMLFormElement>, onSuccess: () => void) => {
    e.preventDefault();
    if (isThemeSubmitting) return;

    // 현재 validationMessages 상태를 활용하여 검증
    const hasErrors = themeValidationMessages.some((msg) => msg.type === 'error');
    if (hasErrors || !wordsTheme.trim()) {
      addToast({
        title: '입력 오류',
        description: '모든 입력 조건을 만족해야 합니다.',
        variant: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsThemeSubmitting(true);

      await gameSocketHandlers.updateSettings({
        settings: { wordsTheme: wordsTheme.trim() },
      });

      if (roomSettings) {
        actions.updateRoomSettings({
          ...roomSettings,
          wordsTheme: wordsTheme.trim(),
        });
      }

      addToast({
        title: '테마 설정 완료',
        description: `제시어 테마가 '${wordsTheme.trim()}'(으)로 설정되었습니다.`,
        variant: 'success',
        duration: 2000,
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      addToast({
        title: '설정 실패',
        description: '테마 설정 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setIsThemeSubmitting(false);
    }
  };

  // 제출 가능 여부 확인
  const isThemeSubmitDisabled =
    themeValidationMessages.some((msg) => msg.type === 'error') || !wordsTheme.trim() || isThemeSubmitting;

  return {
    changeTheme,
    submitTheme,
    isThemeSubmitDisabled,
    wordsTheme,
    isThemeSubmitting,
    themeValidationMessages,
    updateSetting,
    checkCanSettingEdit,
    selectedValues,
  };
};
