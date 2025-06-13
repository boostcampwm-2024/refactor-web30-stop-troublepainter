export interface LinkedNode<T> {
  key: string;
  data: T;
  prev: LinkedNode<T> | null;
  next: LinkedNode<T> | null;
}

export class LinkedList<T> {
  #head: LinkedNode<T> | null = null;
  #tail: LinkedNode<T> | null = null;
  #nodes = new Map<string, LinkedNode<T>>();
  #compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.#compare = compare;
  }

  get head() {
    return this.#head;
  }

  get tail() {
    return this.#tail;
  }

  getNode(key: string): LinkedNode<T> | undefined {
    return this.#nodes.get(key);
  }

  insert(key: string, data: T): LinkedNode<T> {
    if (this.#nodes.get(key)) return this.#nodes.get(key)!;

    const newNode: LinkedNode<T> = { key, data, prev: null, next: null };

    if (!this.#head) this.#head = this.#tail = newNode;
    else {
      let curr = this.#tail;
      while (curr && this.#compare(curr.data, data) > 0) {
        curr = curr.prev;
      }

      if (!curr) {
        newNode.next = this.#head;
        this.#head.prev = newNode;
        this.#head = newNode;
      } else {
        newNode.prev = curr;
        newNode.next = curr.next;

        if (curr.next) curr.next.prev = newNode;
        else this.#tail = newNode;

        curr.next = newNode;
      }
    }

    this.#nodes.set(key, newNode);
    return newNode;
  }

  remove(key: string) {
    const node = this.#nodes.get(key);
    if (!node) return;

    if (node.prev) node.prev.next = node.next;
    else this.#head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.#tail = node.prev;

    this.#nodes.delete(key);
  }

  *[Symbol.iterator]() {
    let curr = this.#head;
    while (curr) {
      yield curr;
      curr = curr.next;
    }
  }
}
