import { ILockProvider } from './base';

type ExpireAt = number;
type LeaseID = number;
type LockData = [ExpireAt, LeaseID, boolean];

function monotime_msec(): number {
  const nanos = process.hrtime.bigint();
  return Number(nanos) / 1000000;
}

export class LocalProvider implements ILockProvider {
  private valueMap: Map<string, LockData>;

  constructor() {
    this.valueMap = new Map<string, LockData>();
  }

  public flush(): Promise<void> {
    this.valueMap.clear();
    return Promise.resolve();
  }

  public acquire(key: string, ttl: number, id?: number): Promise<LeaseID> {
    const lockData = this.valueMap.get(key);

    // Have we seen this lock before?
    if (lockData !== undefined) {
      // if so, is it currently acquired?
      const [expireAt, leaseId, isAquired] = lockData;

      if (isAquired && monotime_msec() < expireAt) {
        return Promise.reject(`Already acquired with lease id ${leaseId}!`);
      }
    }

    const expireAt = monotime_msec() + ttl;
    const leaseId = id ? id : 1;
    this.valueMap.set(key, [expireAt, leaseId, true]);
    return Promise.resolve(leaseId);
  }

  public release(key: string, leaseId: number): Promise<void> {
    const lockData = this.valueMap.get(key);

    if (lockData !== undefined) {
      if (lockData[1] !== leaseId) {
        return Promise.reject(new ReferenceError('Wrong leaseId given'));
      }
      lockData[2] = false;
      this.valueMap.set(key, lockData);
    }

    return Promise.resolve();
  }
}
