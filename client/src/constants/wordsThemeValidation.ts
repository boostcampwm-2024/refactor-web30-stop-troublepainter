// 단순한 값이 아니라 배열, 정규식 등이라 const 객체 리터럴 사용
export const VALIDATION_REGEX = {
  KOREAN_INITIAL_SOUND: /[ㄱ-ㅎ]/,
  SPECIAL_CHARS: /[!@#$%^&*()+\-=\[\]{};'"\\|<>]/,
  NUMBERS_ONLY: /^\d+$/,
} as const;

// 부적절한 단어 목록은 외부 라이브러리로 대체
