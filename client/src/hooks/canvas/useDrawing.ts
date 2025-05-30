import { RefObject, useCallback, useRef } from 'react';
import {
  Point,
  CRDTMessage,
  CRDTMessageTypes,
  CRDTUpdateMessage,
  CRDTSyncMessage,
  RoomStatus,
  DrawingData,
  RegisterState,
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
    (points: Point[]): DrawingData => ({
      points,
      style: operation.getCurrentStyle(),
      timestamp: Date.now(),
    }),
    [operation],
  );

  const renderStroke = useCallback(
    (strokeData: DrawingData, position: 'middle' | 'end') => {
      if (position === 'middle') {
        operation.redrawCanvas();
      } else {
        if (strokeData.points.length > 3) {
          operation.applyFill(strokeData);
        } else {
          operation.drawStroke(strokeData);
        }
      }
    },
    [operation],
  );

  const startDrawing = useCallback(
    (point: Point): CRDTUpdateMessage | null => {
      if (state.checkInkAvailability() === false || !state.crdtRef.current) return null;

      state.currentStrokeIdsRef.current = [];
      currentDrawingPoints.current = state.drawingMode === DRAWING_MODE.PEN ? [point] : [];

      const drawingData =
        state.drawingMode === DRAWING_MODE.FILL
          ? operation.floodFill(Math.floor(point.x), Math.floor(point.y))
          : createDrawingData([point]);

      if (!drawingData) return null;

      const { id, position } = state.crdtRef.current.addStroke(drawingData);
      state.currentStrokeIdsRef.current.push(id);
      renderStroke(drawingData, position);

      return {
        type: CRDTMessageTypes.UPDATE,
        state: {
          key: id,
          register: state.crdtRef.current.state[id],
        },
      };
    },
    [state, operation, createDrawingData, renderStroke],
  );

  const continueDrawing = useCallback(
    (point: Point): CRDTUpdateMessage | null => {
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

      const drawingData = createDrawingData([...currentDrawingPoints.current]);

      const { id, position } = state.crdtRef.current.addStroke(drawingData);
      state.currentStrokeIdsRef.current.push(id);
      renderStroke(drawingData, position);

      // 점이 3개 이상일 때 그 이전 점 삭제
      if (currentDrawingPoints.current.length >= 3) {
        const [, p1, curr] = currentDrawingPoints.current;

        // 최신 점만 남기기
        currentDrawingPoints.current = [p1, curr];
      }

      return {
        type: CRDTMessageTypes.UPDATE,
        state: {
          key: id,
          register: state.crdtRef.current.state[id],
        },
      };
    },
    [state, createDrawingData, renderStroke],
  );

  const stopDrawing = useCallback(() => {
    if (!state.crdtRef.current || state.currentStrokeIdsRef.current.length === 0) return;

    if (state.historyPointerRef.current < state.strokeHistoryRef.current.length - 1) {
      state.strokeHistoryRef.current = state.strokeHistoryRef.current.slice(0, state.historyPointerRef.current + 1);
    }

    const firstStroke = state.crdtRef.current.strokes.find((s) => s.id === state.currentStrokeIdsRef.current[0]);
    if (!firstStroke) return;

    state.strokeHistoryRef.current.push({
      strokeIds: [...state.currentStrokeIdsRef.current],
      isLocal: true,
      drawingData: firstStroke.stroke,
      timestamp: firstStroke.stroke.timestamp,
    });

    state.historyPointerRef.current = state.strokeHistoryRef.current.length - 1;
    currentDrawingPoints.current = [];
    state.currentStrokeIdsRef.current = [];
    state.updateHistoryState();
  }, [state]);

  const undo = useCallback((): CRDTUpdateMessage[] | null => {
    if (!state.crdtRef.current || state.historyPointerRef.current < 0) return null;

    let currentEntry = state.strokeHistoryRef.current[state.historyPointerRef.current];
    while (currentEntry && !currentEntry.isLocal && state.historyPointerRef.current > 0) {
      state.historyPointerRef.current--;
      currentEntry = state.strokeHistoryRef.current[state.historyPointerRef.current];
    }

    if (!currentEntry?.isLocal) return null;

    const updates = currentEntry.strokeIds.map((strokeId): CRDTUpdateMessage => {
      state.crdtRef.current!.deactivateStroke(strokeId);
      const baseRegister = state.crdtRef.current!.state[strokeId];
      const register: RegisterState<DrawingData | null> = {
        peerId: baseRegister.peerId,
        timestamp: baseRegister.timestamp,
        value: baseRegister.value,
        isDeactivated: true,
      };

      return {
        type: CRDTMessageTypes.UPDATE,
        state: {
          key: strokeId,
          register,
        },
      };
    });

    state.historyPointerRef.current--;
    state.updateHistoryState();
    operation.redrawCanvas();

    return updates;
  }, [state, operation]);

  const redo = useCallback((): CRDTUpdateMessage[] | null => {
    if (!state.crdtRef.current || state.historyPointerRef.current >= state.strokeHistoryRef.current.length - 1)
      return null;

    let nextEntry = state.strokeHistoryRef.current[state.historyPointerRef.current + 1];
    while (
      nextEntry &&
      !nextEntry.isLocal &&
      state.historyPointerRef.current < state.strokeHistoryRef.current.length - 1
    ) {
      state.historyPointerRef.current++;
      nextEntry = state.strokeHistoryRef.current[state.historyPointerRef.current + 1];
    }

    if (!nextEntry?.isLocal || !nextEntry.drawingData) return null;

    const updates = nextEntry.strokeIds.map((strokeId): CRDTUpdateMessage => {
      state.crdtRef.current!.activateStroke(strokeId);
      const baseRegister = state.crdtRef.current!.state[strokeId];
      const register: RegisterState<DrawingData | null> = {
        peerId: baseRegister.peerId,
        timestamp: baseRegister.timestamp,
        value: baseRegister.value,
        isDeactivated: false,
      };

      return {
        type: CRDTMessageTypes.UPDATE,
        state: {
          key: strokeId,
          register,
        },
      };
    });

    state.historyPointerRef.current++;
    state.updateHistoryState();
    operation.redrawCanvas();

    return updates;
  }, [state, operation]);

  const applyDrawing = useCallback(
    (crdtDrawingData: CRDTMessage) => {
      if (!state.crdtRef.current) return;

      if (crdtDrawingData.type === CRDTMessageTypes.SYNC) {
        const { requiresRedraw } = state.crdtRef.current.merge(crdtDrawingData.state);
        if (requiresRedraw) {
          operation.redrawCanvas();
        }

        if (roomStatus === 'DRAWING') {
          state.strokeHistoryRef.current = [];
          state.historyPointerRef.current = -1;
          state.updateHistoryState();
        }
      } else if (crdtDrawingData.type === CRDTMessageTypes.UPDATE) {
        const { key, register } = crdtDrawingData.state;
        const peerId = key.split('-')[0];
        const isLocalUpdate = peerId === state.currentPlayerId;

        if (isLocalUpdate) return;

        // CRDT 상태 업데이트
        const { updated, position } = state.crdtRef.current.mergeRegister(key, register);
        if (!updated) return;

        const stroke = register.value;
        const isDeactivated = register.isDeactivated ?? false;

        // 새로운 스트로크이고 비활성화되지 않은 경우만 히스토리에 추가
        const existingEntryIndex = state.strokeHistoryRef.current.findIndex((entry) => entry.strokeIds.includes(key));

        if (existingEntryIndex === -1 && stroke && !isDeactivated) {
          state.strokeHistoryRef.current.push({
            strokeIds: [key],
            isLocal: false,
            drawingData: stroke,
            timestamp: stroke.timestamp || Date.now(),
          });
          state.updateHistoryState();
        }

        if (position === 'middle' || existingEntryIndex !== -1 || isDeactivated) {
          operation.redrawCanvas();
        } else if (stroke) {
          if (stroke.points.length > 3) {
            operation.applyFill(stroke);
          } else {
            operation.drawStroke(stroke);
          }
        }
      }
    },
    [state.currentPlayerId, operation, roomStatus],
  );

  const getAllDrawingData = useCallback((): CRDTSyncMessage | null => {
    if (!state.crdtRef.current) return null;

    return {
      type: CRDTMessageTypes.SYNC,
      state: state.crdtRef.current.state,
    };
  }, [state.crdtRef]);

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
    getAllDrawingData,
    resetCanvas,
  };
};
