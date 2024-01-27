import { ILockProvider } from './provider/base';

export interface ILock {
  /**
   * Acquire a lock from this provider. A provider must provide the following guarantees to the client:
   * - Atomicity: No two processes can acquire the same lock via a race condition
   * - Monotonicity: Repeated accesses of the same lock MUST return a monotonically increasing id. This depends on the provider's backend using durable storage.
   *
   * A provider is not expected to guarantee to the client:
   * - Linearizability:
   */
  acquire(): Promise<this>;

  /**
   * Release the lock
   */
  release(): Promise<void>;

  with<T>(fn: () => T | Promise<T>): Promise<T>;
}

export class Lock implements ILock {
  constructor(
    private provider: ILockProvider,
    private key: string,
    private ttl: number,
    private id?: number,
  ) {
    if (!ttl || ttl < 1000) {
      throw new RangeError('The TTL for a lock must be at least 1 second');
    }
  }

  public acquire(): Promise<this> {
    return this.provider.acquire(this.key, this.ttl, this.id).then(leaseId => {
      this.id = leaseId;
      return this;
    });
  }

  public with<T>(fn: () => T | Promise<T>): Promise<T> {
    return this.acquire()
      .then(fn)
      .then(value => this.release().then(() => value))
      .catch(err =>
        this.release().then(() => {
          throw err;
        }),
      );
  }

  public release(): Promise<void> {
    return Promise.resolve();
  }
}
