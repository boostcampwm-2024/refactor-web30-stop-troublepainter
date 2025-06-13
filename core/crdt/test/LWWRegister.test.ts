import { LWWRegister } from '@/crdt/LWWRegister';
import { DrawingData, RegisterState } from '@/types/crdt.types';

describe('LWWRegister', () => {
  const createTestStroke = (color: string = '#000000', width: number = 2): DrawingData => ({
    points: [
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 4, y: 4 },
      { x: 6, y: 6 },
      { x: 8, y: 8 },
      { x: 10, y: 10 },
    ],
    style: { color, width },
  });

  let register: LWWRegister<DrawingData | null>;

  beforeEach(() => {
    const timestamp = Date.now();
    const initialStroke = createTestStroke();
    const initialState: RegisterState<DrawingData | null> = {
      peerId: 'peer1',
      createTime: timestamp,
      timestamp: timestamp,
      value: initialStroke,
      activated: true,
    };
    register = new LWWRegister('peer1', initialState);
  });

  describe('initialization', () => {
    it('should initialize with given state', () => {
      const stroke = createTestStroke('#ff0000');
      const timestamp = Date.now();
      const state: RegisterState<DrawingData> = {
        peerId: 'peer1',
        createTime: timestamp,
        timestamp: timestamp,
        value: stroke,
        activated: true,
      };

      const newRegister = new LWWRegister<DrawingData>('peer1', state);

      // 초기화된 값들 검증
      expect(newRegister.value).toEqual(stroke);
      expect(newRegister.state).toEqual(state);
      expect(newRegister.id).toBe('peer1');
      expect(newRegister.activated).toBe(true);
    });

    it('should initialize with deactivated state', () => {
      const stroke = createTestStroke('#ff0000');
      const timestamp = Date.now();
      const state: RegisterState<DrawingData> = {
        peerId: 'peer1',
        createTime: timestamp,
        timestamp: timestamp,
        value: stroke,
        activated: false,
      };

      const newRegister = new LWWRegister<DrawingData>('peer1', state);
      expect(newRegister.activated).toBe(false);
    });
  });

  describe('value updates', () => {
    it('should update value with set() method', () => {
      const newStroke = createTestStroke('#ff0000');
      register.set(newStroke);

      // 값이 정상적으로 업데이트되었는지 확인
      expect(register.value).toEqual(newStroke);
      // peer ID는 변경되지 않아야 함
      expect(register.state.peerId).toBe('peer1');
      // 새로운 타임스탬프가 생성되어야 함
      expect(typeof register.state.timestamp).toBe('number');
      expect(register.activated).toBe(true);
    });

    it('should allow setting null values', () => {
      register.set(null);
      // null 값 설정이 가능해야 함
      expect(register.value).toBeNull();
    });

    it('should preserve deactivated state when setting new value', () => {
      register.setActivated(false);
      const newStroke = createTestStroke('#ff0000');
      register.set(newStroke);

      expect(register.value).toEqual(newStroke);
      expect(register.activated).toBe(false);
    });
  });

  describe('activation state', () => {
    it('should update activation state', () => {
      expect(register.activated).toBe(true);
      register.setActivated(false);
      expect(register.activated).toBe(false);
      register.setActivated(true);
      expect(register.activated).toBe(true);
    });
  });

  describe('merge behavior', () => {
    it('should accept updates with newer timestamps', () => {
      // 가짜 타이머 사용 시작
      vi.useFakeTimers();

      const oldTime = Date.now();
      vi.setSystemTime(oldTime);

      // 로컬 stroke 설정
      const localStroke = createTestStroke('#ff0000');
      register.set(localStroke);

      // 더 새로운 타임스탬프로 원격 상태 생성
      const newTime = oldTime + 1000;
      vi.setSystemTime(newTime);
      const remoteStroke = createTestStroke('#00ff00');
      const remoteState: RegisterState<DrawingData> = {
        peerId: 'peer2',
        createTime: register.state.createTime,
        timestamp: newTime,
        value: remoteStroke,
        activated: true,
      };

      const updated = register.merge(remoteState);

      // 새로운 타임스탬프의 값으로 업데이트되어야 함
      expect(updated).toBe(true);
      expect(register.value).toEqual(remoteStroke);

      // 실제 타이머로 복구
      vi.useRealTimers();
    });

    it('should reject updates with older timestamps', () => {
      // 가짜 타이머 사용 시작
      vi.useFakeTimers();

      const newTime = Date.now() + 1000;
      vi.setSystemTime(newTime);

      // 로컬 stroke 설정
      const localStroke = createTestStroke('#ff0000');
      register.set(localStroke);

      // 더 오래된 타임스탬프로 원격 상태 생성
      const oldTime = newTime - 1000;
      const remoteStroke = createTestStroke('#00ff00');
      const remoteState: RegisterState<DrawingData> = {
        peerId: 'peer2',
        createTime: register.state.createTime,
        timestamp: oldTime,
        value: remoteStroke,
        activated: true,
      };

      const updated = register.merge(remoteState);

      // 오래된 타임스탬프는 거절되어야 함
      expect(updated).toBe(false);
      // 로컬 값이 유지되어야 함
      expect(register.value).toEqual(localStroke);

      // 실제 타이머로 복구
      vi.useRealTimers();
    });

    it('should use peerId as tiebreaker for equal timestamps', () => {
      // 동일한 타임스탬프에서의 충돌 해결 테스트
      const timestamp = Date.now();
      const localStroke = createTestStroke('#ff0000');
      const localState: RegisterState<DrawingData> = {
        peerId: 'peer1',
        createTime: timestamp,
        timestamp,
        value: localStroke,
        activated: true,
      };
      const localRegister = new LWWRegister('peer1', localState);

      // 동일한 타임스탬프지만 더 높은 peer ID를 가진 원격 상태 생성
      const remoteStroke = createTestStroke('#00ff00');
      const remoteState: RegisterState<DrawingData> = {
        peerId: 'peer2',
        createTime: timestamp,
        timestamp,
        value: remoteStroke,
        activated: true,
      };

      const updated = localRegister.merge(remoteState);

      // peer ID가 더 큰 값으로 업데이트되어야 함
      expect(updated).toBe(true);
      expect(localRegister.value).toEqual(remoteStroke);
    });

    it('should handle null values in merge', () => {
      const timestamp = Date.now();
      // null 값을 포함한 원격 상태 생성
      const remoteState: RegisterState<DrawingData | null> = {
        peerId: 'peer2',
        createTime: register.state.createTime,
        timestamp: timestamp + 1000,
        value: null,
        activated: true,
      };

      const updated = register.merge(remoteState);

      // null 값도 정상적으로 병합되어야 함
      expect(updated).toBe(true);
      expect(register.value).toBeNull();
    });
  });
});
