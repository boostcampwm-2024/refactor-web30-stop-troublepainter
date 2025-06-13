import { MapState, RegisterState } from '@/types/crdt.types';
import { LWWRegister } from './LWWRegister';
import { LinkedList } from './LinkedList';

export class LWWMap<T> {
  readonly id: string;
  #sortedList: LinkedList<LWWRegister<T | null>>;

  constructor(id: string, state?: MapState<T>) {
    this.id = id;
    this.#sortedList = new LinkedList<LWWRegister<T | null>>(this.#compareRegisters);

    if (!state) return;

    for (const [key, registerState] of Object.entries(state)) {
      const register = new LWWRegister(this.id, registerState);
      this.#sortedList.insert(key, register);
    }
  }

  #compareRegisters = (a: LWWRegister<T | null>, b: LWWRegister<T | null>) => {
    return LWWRegister.compareByCreateTime(a.state, b.state);
  };

  get sortedStrokes() {
    const strokes = [];
    for (const node of this.#sortedList) {
      const value = node.data.value;
      if (value !== null && node.data.state.activated) strokes.push({ key: node.key, value });
    }
    return strokes;
  }

  get state() {
    const object: MapState<T> = {};
    for (const node of this.#sortedList) {
      object[node.key] = node.data.state;
    }
    return object;
  }

  getValue(key: string) {
    return this.#sortedList.getNode(key)?.data.value;
  }

  getState(key: string) {
    return this.#sortedList.getNode(key)?.data.state;
  }

  createRegister(value: T) {
    const key = `${this.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = Date.now();

    const register = new LWWRegister(this.id, {
      peerId: this.id,
      timestamp: now,
      createTime: now,
      value,
      activated: true,
    });

    const node = this.#sortedList.insert(key, register);
    return node;
  }

  updateRegister(key: string, value: T) {
    const node = this.#sortedList.getNode(key);
    if (!node) return;

    node.data.set(value);
    return node;
  }

  deleteRegister(key: string) {
    const node = this.#sortedList.getNode(key);
    if (!node) return;

    node.data.set(null);
    return node;
  }

  setRegisterActivated(key: string, activated: boolean) {
    const node = this.#sortedList.getNode(key);
    if (!node) return;

    node.data.setActivated(activated);
    return node;
  }

  mergeRegister(key: string, remote: RegisterState<T | null>) {
    const existingNode = this.#sortedList.getNode(key);

    if (!existingNode) {
      const newRegister = new LWWRegister(remote.peerId, remote);
      const newNode = this.#sortedList.insert(key, newRegister);
      const haveToReset = newNode !== this.#sortedList.tail;
      return { updated: true, haveToReset };
    }

    const merged = existingNode.data.merge(remote);
    if (!merged) return { updated: false, haveToReset: false };

    return { updated: true, haveToReset: true };
  }

  mergeMap(state: MapState<T>) {
    let requiresRedraw = false;
    for (const [key, remote] of Object.entries(state)) {
      const { haveToReset } = this.mergeRegister(key, remote);
      if (haveToReset) requiresRedraw = true;
    }
    return { requiresRedraw };
  }
}
