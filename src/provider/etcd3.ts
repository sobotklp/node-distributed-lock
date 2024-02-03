import { Lease } from 'etcd3';
import { ILockProvider, LeaseID } from './base';

export class Etcd3Provider implements ILockProvider {
  private leaseMap: Map<string, Lease>;

  constructor(
    private etcd3client: any,
    private keyPrefix: string = 'node-distributed-lock/',
  ) {
    this.leaseMap = new Map<string, Lease>();
  }

  public async acquire(key: string, ttl: number, id?: number): Promise<LeaseID> {
    const etcdKey = this.keyPrefix + key;

    const lease = this.etcd3client.lease(ttl / 1000); // Etcd leases are in seconds
    const leaseId = await lease.grant();
    console.log(id, leaseId);

    lease.on('lost', (err: Error) => {
      console.log(err);

      // We lost the lease because of this given error
      // TODO: Something better
      this.leaseMap.delete(etcdKey);
    });

    return this.etcd3client
      .if(etcdKey, 'Create', '==', 0)
      .then(this.etcd3client.put(etcdKey).lease(leaseId))
      .else(this.etcd3client.get(etcdKey))
      .commit()
      .then((result: any) => {
        if (result.succeeded) {
          this.leaseMap.set(etcdKey, lease);
          return parseInt(result.header.revision);
        }

        // Failed to create the lock
        return lease
          .revoke()
          .catch(() => undefined)
          .then(() => {
            return Promise.reject(`Already acquired!`);
          });
      });
  }

  public release(key: string, leaseId: number): Promise<void> {
    const etcdKey = this.keyPrefix + key;
    const lease = this.leaseMap.get(etcdKey);

    if (lease === undefined) {
      return Promise.resolve();
    }
    console.log(`Removing ${leaseId}`);

    return lease.revoke();
  }

  public flush(): Promise<void> {
    // Deliberately not implemented
    return Promise.resolve();
  }
}
