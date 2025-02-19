import { check } from 'korcen';
import { VALIDATION_REGEX } from '@/constants/wordsThemeValidation';
import { WordsThemeValidationMessage } from '@/types/wordsTheme.types';

export const validateWordsTheme = (theme: string): WordsThemeValidationMessage[] => {
  if (!theme.trim()) {
    return [{ type: 'warning', message: '테마를 입력해주세요.' }];
  }

  // 기본 유효성 검사
  const validations: Array<[boolean, string]> = [
    [theme.length < 2, '테마는 최소 2자 이상이어야 합니다.'],
    [theme.length > 20, '테마는 20자를 초과할 수 없습니다.'],
    [VALIDATION_REGEX.KOREAN_INITIAL_SOUND.test(theme), '초성은 테마에 사용할 수 없습니다.'],
    [VALIDATION_REGEX.SPECIAL_CHARS.test(theme), '일부 특수문자는 사용할 수 없습니다.'],
    [VALIDATION_REGEX.NUMBERS_ONLY.test(theme), '숫자로만 이루어진 테마는 사용할 수 없습니다.'],
  ];

  // korcen을 사용한 비속어 검사
  const detectedBadWord = check(theme);
  if (detectedBadWord) {
    return [{ type: 'error', message: '부적절한 단어가 포함되어 있습니다.' }];
  }

  // 기본 유효성 검사 결과 처리
  const errors = validations
    .filter(([condition]) => condition)
    .map(([, message]) => ({ type: 'error' as const, message }));

  return errors.length ? errors : [{ type: 'success', message: '올바른 테마입니다!' }];
};
