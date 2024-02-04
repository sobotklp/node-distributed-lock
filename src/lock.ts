import { ILockProvider } from './provider/base';

export interface ILock {
  /**
   * leaseId is a monotonically increasing numeric value
   *
   * All future processes that acquire the lock are guaranteed to have a higher leaseId number.
   */
  leaseId: number;

  /**
   * Acquire a lock from this provider. A provider must provide the following guarantees to the client:
   * - Atomicity: No two processes can acquire the same lock via a race condition
   * - Monotonicity: Repeated accesses of the same lock MUST return a monotonically increasing id. This depends on the provider's backend using durable storage.
   *
   * A provider is not expected to guarantee to the client:
   * - Linearizability: Because locking is never perfectly reliable, the user must take extra steps to ensure the correct write order.
   */
  acquire(): Promise<this>;

  /**
   * Release the lock
   */
  release(): Promise<void>;

  with<T>(fn: () => T | Promise<T>): Promise<T>;
}

export class Lock implements ILock {
  public leaseId: number;

  constructor(
    private provider: ILockProvider,
    public key: string,
    public ttl: number,
    private id: number | undefined,
  ) {
    if (!ttl || ttl < 1000) {
      throw new RangeError('The TTL for a lock must be at least 1 second');
    }
  }

  public acquire(): Promise<this> {
    return this.provider.acquire(this.key, this.ttl, this.id).then(leaseId => {
      this.leaseId = leaseId;
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
    return this.provider.release(this.key, this.leaseId);
  }
}
