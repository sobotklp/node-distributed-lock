export type LeaseID = number;

export interface ILockProvider {
  /**
   *
   * @param key The unique name of the lock
   * @param ttl The expiry time of the lock, in milliseconds
   * @param id? To acquire the lock, the id on the server must be equal to or less than this value.
   */
  acquire(key: string, ttl: number, id?: number): Promise<LeaseID>;

  /**
   * Release the lock given by key. If the lock is not currently acquired, an error is thrown
   *
   * @param key The name of the lock to release.
   */
  release(key: string): Promise<void>;

  /**
   * Erase all values in the lock store. Only used for testing
   */
  flush(): Promise<void>;
}
