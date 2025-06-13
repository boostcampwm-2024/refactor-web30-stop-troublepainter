import { RefObject, useCallback, useRef } from 'react';
import {
  Point,
  CRDTMessage,
  CRDTMessageTypes,
  CRDTUpdateMessage,
  CRDTSyncMessage,
  RoomStatus,
  DrawingData,
  DrawType,
} from '@troublepainter/core';
import { useDrawingOperation } from './useDrawingOperation';
import { useDrawingState } from './useDrawingState';
import { DRAWING_MODE } from '@/constants/canvasConstants';

/**
 * 캔버스 드로잉 기능을 관리하는 Hook입니다.
 *
 * @remarks
 * 캔버스의 실제 드로잉 작업을 처리합니다.
 * - 펜/채우기 모드 드로잉
 * - 실행 취소/다시 실행
 * - 잉크 잔량 관리
 * - 실시간 드로잉 데이터 동기화 및 기록
 *
 * 드로잉은 mousedown부터 mouseup까지를 하나의 단위로 처리하며,
 * 실시간으로는 각 stroke 단위로 동기화하고 히스토리는 mouseup 단위로 기록됩니다.
 *
 * @param canvasRef - 캔버스 엘리먼트의 RefObject
 * @param options - 드로잉 설정 옵션
 * @param options.maxPixels - 최대 사용 가능한 픽셀 수
 *
 * @example
 * ```tsx
 * const GameCanvas = ({ role, maxPixels = 100000 }: GameCanvasProps) => {
 *   const canvasRef = useRef<HTMLCanvasElement>(null);
 *
 *   const {
 *     currentColor,
 *     brushSize,
 *     drawingMode,
 *     inkRemaining,
 *     startDrawing,
 *     continueDrawing,
 *     stopDrawing,
 *   } = useDrawing(canvasRef, { maxPixels });
 *
 *   const handleDrawStart = useCallback((e: ReactMouseEvent | ReactTouchEvent) => {
 *     const point = getDrawPoint(e, canvasRef.current);
 *     startDrawing(point);
 *   }, [startDrawing]);
 *
 *   return (
 *     <Canvas
 *       canvasRef={canvasRef}
 *       isDrawable={true}
 *       brushSize={brushSize}
 *       inkRemaining={inkRemaining}
 *     />
 *   );
 * };
 * ```
 *
 * @returns 드로잉 관련 상태와 메소드들을 포함하는 객체
 * @property currentColor - 현재 선택된 색상
 * @property setCurrentColor - 현재 색상을 변경하는 함수
 * @property brushSize - 현재 브러시 크기
 * @property setBrushSize - 브러시 크기를 변경하는 함수
 * @property drawingMode - 현재 드로잉 모드 (펜/채우기)
 * @property setDrawingMode - 드로잉 모드를 변경하는 함수
 * @property inkRemaining - 남은 잉크량
 * @property canUndo - 실행 취소 가능 여부
 * @property canRedo - 다시 실행 가능 여부
 * @property startDrawing - 드로잉 시작 함수 (mousedown)
 * @property continueDrawing - 드로잉 진행 함수 (mousemove)
 * @property stopDrawing - 드로잉 종료 함수 (mouseup)
 * @property applyDrawing - 외부 드로잉 데이터 적용 함수
 * @property undo - 마지막 드로잉 작업을 실행 취소하는 함수
 * @property redo - 마지막으로 실행 취소된 작업을 다시 실행하는 함수
 *
 * @category Hooks
 */
export const useDrawing = (
  canvasRef: RefObject<HTMLCanvasElement>,
  roomStatus: RoomStatus,
  options?: { maxPixels?: number },
) => {
  const state = useDrawingState(options);
  const operation = useDrawingOperation(canvasRef, state);
  const currentDrawingPoints = useRef<Point[]>([]);

  const createDrawingData = useCallback(
    (points: Point[], type: DrawType): DrawingData => ({
      type,
      points,
      style: operation.getCurrentStyle(),
    }),
    [operation],
  );

  const makeCRDTUpdateMessage = useCallback(
    (key: string): CRDTUpdateMessage<DrawingData> | null => {
      const crdt = state.crdtRef.current;
      if (!crdt) return null;

      const register = crdt.getState(key);
      if (!register) return null;

      return {
        type: CRDTMessageTypes.UPDATE,
        state: {
          key,
          register,
        },
      };
    },
    [state.crdtRef],
  );

  const makeCRDTSyncMessage = useCallback((): CRDTSyncMessage<DrawingData> | null => {
    if (!state.crdtRef.current) return null;

    return {
      type: CRDTMessageTypes.SYNC,
      state: state.crdtRef.current.state,
    };
  }, [state.crdtRef]);

  const startDrawing = useCallback(
    (point: Point): CRDTUpdateMessage<DrawingData> | null => {
      if (state.checkInkAvailability() === false || !state.crdtRef.current) return null;

      state.currentStrokeIdsRef.current = [];
      currentDrawingPoints.current = state.drawingMode === DRAWING_MODE.PEN ? [point] : [];

      const drawingData =
        state.drawingMode === DRAWING_MODE.FILL
          ? createDrawingData([{ x: Math.floor(point.x), y: Math.floor(point.y) }], DrawType.FILL)
          : createDrawingData([point], DrawType.LINE);

      if (!drawingData) return null;

      const node = state.crdtRef.current.createRegister(drawingData);
      state.currentStrokeIdsRef.current.push(node.key);

      if (node.next !== null) operation.redrawCanvas();
      else operation.renderStroke(drawingData);

      return makeCRDTUpdateMessage(node.key);
    },
    [state, operation, createDrawingData, makeCRDTUpdateMessage],
  );

  const continueDrawing = useCallback(
    (point: Point): CRDTUpdateMessage<DrawingData> | null => {
      if (!state.crdtRef.current || currentDrawingPoints.current.length === 0 || state.inkRemaining <= 0) return null;
      if (state.drawingMode === DRAWING_MODE.FILL) return null;

      const lastPoint = currentDrawingPoints.current[currentDrawingPoints.current.length - 1];
      if (lastPoint.x === point.x && lastPoint.y === point.y) return null;
      const pixelsUsed = Math.ceil(
        Math.sqrt(Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)) * state.brushSize,
      );
      state.setInkRemaining((prev: number) => Math.max(0, prev - pixelsUsed));

      // 최근 3개 점 유지
      currentDrawingPoints.current.push(point);

      const drawingData = createDrawingData([...currentDrawingPoints.current], DrawType.LINE);
      const node = state.crdtRef.current.createRegister(drawingData);
      state.currentStrokeIdsRef.current.push(node.key);

      if (node.next !== null) operation.redrawCanvas();
      else operation.renderStroke(drawingData);

      // 점이 3개 이상일 때 그 이전 점 삭제
      if (currentDrawingPoints.current.length >= 3) {
        const [, p1, curr] = currentDrawingPoints.current;

        // 최신 점만 남기기
        currentDrawingPoints.current = [p1, curr];
      }
      return makeCRDTUpdateMessage(node.key);
    },
    [state, createDrawingData, makeCRDTUpdateMessage],
  );

  const stopDrawing = useCallback(() => {
    if (!state.crdtRef.current || state.currentStrokeIdsRef.current.length === 0) return;
    if (state.historyPointerRef.current < state.strokeHistoryRef.current.length - 1) {
      state.strokeHistoryRef.current = state.strokeHistoryRef.current.slice(0, state.historyPointerRef.current + 1);
    }

    const firstStrokeKey = state.currentStrokeIdsRef.current[0];
    const firstRegister = state.crdtRef.current.getState(firstStrokeKey);
    if (!firstRegister) return;

    state.strokeHistoryRef.current.push([...state.currentStrokeIdsRef.current]);
    state.historyPointerRef.current = state.strokeHistoryRef.current.length - 1;

    currentDrawingPoints.current = [];
    state.currentStrokeIdsRef.current = [];
    state.updateHistoryState();
  }, [state]);

  const undo = useCallback((): CRDTUpdateMessage<DrawingData>[] | null => {
    const pointer = state.historyPointerRef.current;
    if (!state.crdtRef.current || pointer < 0) return null;

    const strokeGroup = state.strokeHistoryRef.current[pointer];
    if (!strokeGroup) return null;

    const updates: CRDTUpdateMessage<DrawingData>[] = [];

    strokeGroup.forEach((strokeId) => {
      state.crdtRef.current!.setRegisterActivated(strokeId, false);

      const crdtMessage = makeCRDTUpdateMessage(strokeId);
      if (crdtMessage) updates.push(crdtMessage);
    });

    state.historyPointerRef.current--;
    state.updateHistoryState();
    operation.redrawCanvas();

    return updates;
  }, [state, operation]);

  const redo = useCallback((): CRDTUpdateMessage<DrawingData>[] | null => {
    const pointer = state.historyPointerRef.current + 1;
    if (!state.crdtRef.current || pointer >= state.strokeHistoryRef.current.length) return null;

    const strokeGroup = state.strokeHistoryRef.current[pointer];
    if (!strokeGroup) return null;

    const updates: CRDTUpdateMessage<DrawingData>[] = [];

    strokeGroup.forEach((strokeId) => {
      state.crdtRef.current?.setRegisterActivated(strokeId, true);

      const crdtMessage = makeCRDTUpdateMessage(strokeId);
      if (crdtMessage) updates.push(crdtMessage);
    });

    state.historyPointerRef.current = pointer;
    state.updateHistoryState();
    operation.redrawCanvas();

    return updates;
  }, [state, operation]);

  const applyDrawing = useCallback(
    (crdtMessage: CRDTMessage<DrawingData>) => {
      const crdt = state.crdtRef.current;
      if (!crdt) return;

      // 동기화
      if (crdtMessage.type === CRDTMessageTypes.SYNC) {
        const { requiresRedraw } = crdt.mergeMap(crdtMessage.state);
        if (requiresRedraw) operation.redrawCanvas();

        if (roomStatus === 'DRAWING') {
          state.strokeHistoryRef.current = [];
          state.historyPointerRef.current = -1;
          state.updateHistoryState();
        }
      }

      // 작업 기반
      else if (crdtMessage.type === CRDTMessageTypes.UPDATE) {
        const { key, register } = crdtMessage.state;

        const { haveToReset, updated } = crdt.mergeRegister(key, register);
        if (!updated) return;

        if (haveToReset) operation.redrawCanvas();
        else if (register.value) operation.renderStroke(register.value);
      }
    },
    [state.currentPlayerId, operation, roomStatus],
  );

  const resetCanvas = useCallback(() => {
    state.resetDrawingState(); // 상태 초기화
    operation.clearCanvas(); // 캔버스 초기화
  }, [state.resetDrawingState, operation.clearCanvas]);

  return {
    currentColor: state.currentColor,
    setCurrentColor: state.setCurrentColor,
    brushSize: state.brushSize,
    setBrushSize: state.setBrushSize,
    drawingMode: state.drawingMode,
    setDrawingMode: state.setDrawingMode,
    inkRemaining: state.inkRemaining,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    startDrawing,
    continueDrawing,
    stopDrawing,
    applyDrawing,
    undo,
    redo,
    makeCRDTSyncMessage,
    makeCRDTUpdateMessage,
    resetCanvas,
    createDrawingData,
  };
};
