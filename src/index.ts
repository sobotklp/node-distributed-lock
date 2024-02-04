import { InvalidArgumentError } from './errors.js';
import { Lock } from './lock.js';
import { ILockProvider } from './provider/base.js';
import { Etcd3Provider } from './provider/etcd3.js';
import { LocalProvider } from './provider/local.js';
import { RedisProvider } from './provider/redis.js';

export { InvalidArgumentError, LockingFailed } from './errors.js';
export { Lock } from './lock.js';

/**
 * A module that contains the entry point for acquiring a lock
 */
export class DistributedLock {
  private provider: ILockProvider;

  constructor(type: string, backend?: any) {
    switch (type.trim()) {
      case 'local': {
        this.provider = new LocalProvider();
        break;
      }
      case 'redis': {
        this.provider = new RedisProvider(backend);
        break;
      }
      case 'etcd3': {
        this.provider = new Etcd3Provider(backend);
      }
      default: {
        throw new InvalidArgumentError(`Invalid argument given for 'type': ${type}`);
      }
    }
  }

  public getLock(key: string, ttl: number, id?: number): Lock {
    if (ttl < 1000) {
      throw new RangeError('ttl must be at least 1000 milliseconds');
    }

    return new Lock(this.provider, key, ttl, id);
  }
}
