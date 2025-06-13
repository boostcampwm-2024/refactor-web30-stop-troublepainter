export interface Point {
  x: number;
  y: number;
}

export interface StrokeStyle {
  color: string;
  width: number;
}

export interface DrawingData {
  points: Point[];
  style: StrokeStyle;
}

export type RegisterState<T> = {
  peerId: string;
  createTime: number;
  timestamp: number;
  value: T;
  activated: boolean;
};

export type MapState<T> = {
  [key: string]: RegisterState<T | null>;
};

export enum CRDTMessageTypes {
  SYNC = 'sync',
  UPDATE = 'update',
}

export type CRDTSyncMessage<T> = {
  type: CRDTMessageTypes.SYNC;
  state: MapState<T>;
};

export type CRDTUpdateMessage<T> = {
  type: CRDTMessageTypes.UPDATE;
  state: {
    key: string;
    register: RegisterState<T | null>;
  };
};

export type CRDTMessage<T> = CRDTSyncMessage<T> | CRDTUpdateMessage<T>;
