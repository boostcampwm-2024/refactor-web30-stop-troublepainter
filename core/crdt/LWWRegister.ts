import { RegisterState } from '@/types/crdt.types';
export class LWWRegister<T> {
  readonly id: string;
  #state: RegisterState<T>;

  constructor(id: string, initialState: RegisterState<T>) {
    this.id = id;
    this.#state = initialState;
  }

  get value() {
    return this.#state.value;
  }

  get state() {
    return this.#state;
  }

  get activated() {
    return this.#state.activated;
  }

  set(value: T) {
    this.#state = {
      ...this.#state,
      peerId: this.id,
      timestamp: Date.now(),
      value,
    };
  }

  setActivated(activated: boolean) {
    this.#state = {
      ...this.#state,
      peerId: this.id,
      timestamp: Date.now(),
      activated,
    };
  }

  merge(remoteState: RegisterState<T>) {
    const comparison = LWWRegister.compare(this.#state, remoteState);

    // 현재 상태가 더 최신이거나 같으면 merge 안함
    if (comparison >= 0) return false;

    // remote가 더 최신이면 merge
    this.#state = remoteState;
    return true;
  }

  static compare<T>(a: RegisterState<T>, b: RegisterState<T>) {
    // timestamp 우선 비교
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }

    // timestamp 같으면 peerId 비교
    if (a.peerId !== b.peerId) {
      return a.peerId.localeCompare(b.peerId);
    }

    return 0;
  }

  static compareByCreateTime<T>(a: RegisterState<T>, b: RegisterState<T>) {
    if (a.createTime !== b.createTime) {
      return a.createTime - b.createTime;
    }
    if (a.peerId !== b.peerId) {
      return a.peerId.localeCompare(b.peerId);
    }

    return 0;
  }
}
