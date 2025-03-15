export const SHORTCUT_KEYS = {
  // 설정 관련
  DROPDOWN_TOTAL_ROUNDS: {
    key: 'q',
    description: '라운드 수 설정',
  },
  DROPDOWN_MAX_PLAYERS: {
    key: 'w',
    description: '플레이어 수 설정',
  },
  DROPDOWN_DRAW_TIME: {
    key: 'e',
    description: '제한시간 설정',
  },

  // 게임 관련
  CHAT: {
    key: 'enter',
    description: '채팅',
  },
  GAME_START: {
    key: 's',
    description: '게임 시작',
  },
  GAME_INVITE: {
    key: 'd',
    description: '초대하기',
  },

  // 캔버스 관련
  BLACK_COLOR: {
    key: 'a',
    description: '검정색 선택',
  },
  PINK_COLOR: {
    key: 's',
    description: '분홍색 선택',
  },
  YELLOW_COLOR: {
    key: 'd',
    description: '노란색 선택',
  },
  BLUE_COLOR: {
    key: 'f',
    description: '파란색 선택',
  },
  GRAY_COLOR: {
    key: 'g',
    description: '회색 선택',
  },
  PEN: {
    key: 'w',
    description: '펜 도구',
  },
  FILL: {
    key: 'e',
    description: '채우기 도구',
  },
  UNDO: {
    key: 'ctrl+z',
    description: '실행 취소',
  },
  REDO: {
    key: 'ctrl+shift+z',
    description: '다시 실행',
  },
} as const;
