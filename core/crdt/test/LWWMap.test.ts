import { DrawingData, DrawType, MapState, RegisterState } from '@/types/crdt.types';
import { LWWMap } from '@/crdt/LWWMap';

describe('LWWMap', () => {
  const createTestStroke = (color: string = '#000000', width: number = 2): DrawingData => ({
    type: DrawType.PEN,
    points: [
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 4, y: 4 },
      { x: 6, y: 6 },
      { x: 8, y: 8 },
      { x: 10, y: 10 },
    ],
    style: { color, width },
    inkRemaining: Number.MAX_SAFE_INTEGER,
  });

  let map: LWWMap<DrawingData>;

  beforeEach(() => {
    map = new LWWMap('peer1');
  });

  describe('initialization', () => {
    it('should initialize empty map', () => {
      expect(map.sortedStrokes).toHaveLength(0);
      expect(map.state).toEqual({});
    });

    it('should initialize with given state', () => {
      const stroke = createTestStroke();
      const timestamp = Date.now();
      const initialState: MapState<DrawingData> = {
        stroke1: {
          peerId: 'peer1',
          createTime: timestamp,
          timestamp,
          value: stroke,
          activated: true,
        },
      };

      const newMap = new LWWMap('peer1', initialState);

      expect(newMap.sortedStrokes).toHaveLength(1);
      expect(newMap.sortedStrokes[0].value).toEqual(stroke);
      expect(newMap.state).toEqual(initialState);
    });

    it('should initialize with deactivated strokes', () => {
      const stroke = createTestStroke();
      const timestamp = Date.now();
      const initialState: MapState<DrawingData> = {
        stroke1: {
          peerId: 'peer1',
          createTime: timestamp,
          timestamp,
          value: stroke,
          activated: false,
        },
      };

      const newMap = new LWWMap('peer1', initialState);
      expect(newMap.sortedStrokes).toHaveLength(0);
      expect(newMap.state.stroke1.activated).toBe(false);
    });
  });

  describe('stroke operations', () => {
    it('should add new stroke and generate unique id', () => {
      const stroke1 = createTestStroke('#ff0000');
      const stroke2 = createTestStroke('#00ff00');

      const { key: id1 } = map.createRegister(stroke1);
      const { key: id2 } = map.createRegister(stroke2);

      // ID가 서로 달라야 함
      expect(id1).not.toBe(id2);
      // 총 2개의 stroke가 있어야 함
      expect(map.sortedStrokes).toHaveLength(2);
      // 각 stroke 데이터 확인
      expect(map.sortedStrokes.find((s) => s.key === id1)?.value).toEqual(stroke1);
      expect(map.sortedStrokes.find((s) => s.key === id2)?.value).toEqual(stroke2);
    });

    it('should delete existing stroke', () => {
      const stroke = createTestStroke();
      const { key } = map.createRegister(stroke);

      // 처음에는 1개의 stroke
      expect(map.sortedStrokes).toHaveLength(1);

      const deletedNode = map.deleteRegister(key);

      // 삭제 성공 확인
      expect(deletedNode).toBeTruthy();
      // 삭제 후에는 0개
      expect(map.sortedStrokes).toHaveLength(0);
    });

    it('should return false when deleting non-existent stroke', () => {
      const deleted = map.deleteRegister('non-existent-id');
      expect(deleted).toBeFalsy();
    });

    it('should handle stroke deactivation and activation', () => {
      const stroke = createTestStroke();
      const { key } = map.createRegister(stroke);

      expect(map.sortedStrokes).toHaveLength(1);

      const prevActivated = map.setRegisterActivated(key, false);
      expect(prevActivated?.data.activated).toBe(false);
      expect(map.sortedStrokes).toHaveLength(0);

      const afterActivated = map.setRegisterActivated(key, true);
      expect(afterActivated?.data.activated).toBe(true);
      expect(map.sortedStrokes).toHaveLength(1);
    });
  });

  describe('state management', () => {
    it('should maintain correct state after operations', () => {
      const stroke = createTestStroke();
      const { key } = map.createRegister(stroke);

      // 상태 확인
      const state = map.state;
      // stroke 존재 확인
      expect(state[key]).toBeTruthy();
      expect(state[key].value).toEqual(stroke);
      // peer ID 확인
      expect(state[key].peerId).toBe('peer1');
      expect(state[key].activated).toBe(true);

      // 삭제 후 상태 확인
      map.deleteRegister(key);
      // 삭제된 stroke는 null이어야 함
      expect(map.state[key].value).toBeNull();
    });
  });

  describe('concurrent operations', () => {
    let map1: LWWMap<DrawingData>;
    let map2: LWWMap<DrawingData>;

    beforeEach(() => {
      map1 = new LWWMap('peer1');
      map2 = new LWWMap('peer2');
    });

    it('should merge states from different peers', () => {
      // 각 맵에 stroke 추가
      const stroke1 = createTestStroke('#ff0000');
      const stroke2 = createTestStroke('#00ff00');

      map1.createRegister(stroke1);
      map2.createRegister(stroke2);

      // 동기화 시뮬레이션
      map1.mergeMap(map2.state);
      map2.mergeMap(map1.state);

      // 두 맵 모두 두 개의 stroke를 가져야 함
      expect(map1.sortedStrokes).toHaveLength(2);
      expect(map2.sortedStrokes).toHaveLength(2);
      // 상태가 동일해야 함
      expect(map1.state).toEqual(map2.state);
    });

    it('should handle concurrent modifications to same stroke', () => {
      // 가짜 타이머 사용
      vi.useFakeTimers();

      // peer1이 초기 stroke 추가
      const time1 = Date.now();
      vi.setSystemTime(time1);
      const stroke1 = createTestStroke('#ff0000');
      const { key } = map1.createRegister(stroke1);

      // peer2와 동기화
      map2.mergeMap(map1.state);

      // peer1이 stroke 삭제
      const deleteTime = time1 + 1000;
      vi.setSystemTime(deleteTime);
      map1.deleteRegister(key);

      // peer2가 stroke 색상 수정
      const modifyTime = deleteTime + 1000;
      vi.setSystemTime(modifyTime);
      const modifiedStroke = createTestStroke('#0000ff');
      const modifiedState: RegisterState<DrawingData | null> = {
        peerId: 'peer2',
        createTime: time1,
        timestamp: modifyTime,
        value: modifiedStroke,
        activated: true,
      };

      map2.mergeRegister(key, modifiedState);

      // 양방향 동기화
      map1.mergeMap(map2.state);
      map2.mergeMap(map1.state);

      // 두 맵 모두 수정된 stroke를 가져야 함 (새로운 타임스탬프가 우선)
      expect(map1.sortedStrokes).toHaveLength(1);
      expect(map2.sortedStrokes).toHaveLength(1);
      expect(map1.sortedStrokes[0].value?.style.color).toBe('#0000ff');
      expect(map2.sortedStrokes[0].value?.style.color).toBe('#0000ff');

      // 실제 타이머로 복원
      vi.useRealTimers();
    });

    it('should handle concurrent additions and deletions', () => {
      // 가짜 타이머 사용
      vi.useFakeTimers();

      // peer1이 stroke를 추가하고 삭제
      const time1 = Date.now();
      vi.setSystemTime(time1);
      const stroke1 = createTestStroke('#ff0000');
      const { key: id1 } = map1.createRegister(stroke1);

      const deleteTime = time1 + 1000;
      vi.setSystemTime(deleteTime);
      map1.deleteRegister(id1);

      // peer2가 다른 stroke 추가
      const time2 = deleteTime + 1000;
      vi.setSystemTime(time2);
      const stroke2 = createTestStroke('#00ff00');
      const { key: id2 } = map2.createRegister(stroke2);

      // 양방향 동기화
      map1.mergeMap(map2.state);
      map2.mergeMap(map1.state);

      // 두 맵 모두 두 번째 stroke만 가져야 함
      expect(map1.sortedStrokes).toHaveLength(1);
      expect(map2.sortedStrokes).toHaveLength(1);
      expect(map1.sortedStrokes[0].key).toBe(id2);
      expect(map2.sortedStrokes[0].key).toBe(id2);

      // 실제 타이머로 복원
      vi.useRealTimers();
    });

    it('should handle deactivation state during merge', () => {
      // 가짜 타이머 사용
      vi.useFakeTimers();

      const createTime = Date.now();
      vi.setSystemTime(createTime);

      const stroke = createTestStroke();
      const { key } = map1.createRegister(stroke);

      map2.mergeMap(map1.state);

      const deActivateTime = createTime + 1000;
      vi.setSystemTime(deActivateTime);

      map1.setRegisterActivated(key, false);
      map2.mergeMap(map1.state);

      expect(map2.sortedStrokes).toHaveLength(0);

      const activateTime = deActivateTime + 1000;
      vi.setSystemTime(activateTime);

      map1.setRegisterActivated(key, true);
      map2.mergeMap(map1.state);

      expect(map1.sortedStrokes).toHaveLength(1);
      expect(map2.sortedStrokes).toHaveLength(1);
      expect(map1.state).toEqual(map2.state);

      // 실제 타이머로 복원
      vi.useRealTimers();
    });
  });

  describe('active strokes', () => {
    it('should return only active strokes', () => {
      const stroke1 = createTestStroke('#ff0000');
      const stroke2 = createTestStroke('#00ff00');

      const { key: id1 } = map.createRegister(stroke1);
      const { key: id2 } = map.createRegister(stroke2);

      map.setRegisterActivated(id1, false);

      const activeStrokes = map.sortedStrokes;
      expect(activeStrokes).toHaveLength(1);
      expect(activeStrokes[0].key).toBe(id2);
    });
  });
});
