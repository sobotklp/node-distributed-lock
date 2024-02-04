import { expect } from 'chai';
import * as crypto from 'crypto';
import { InvalidArgumentError } from '../errors.js';
import { DistributedLock, Lock } from '../index.js';

describe('LockProvider', () => {
  it("'s constructor throws an error if given an invalid backend type'", () => {
    expect(() => {
      new DistributedLock('BADTYPE');
    }).to.throw(InvalidArgumentError);
  });

  it("'s constructor returns a LockProvider object", () => {
    const distributedLock = new DistributedLock('local');
    expect(distributedLock).to.be.an.instanceof(DistributedLock);
  });

  describe('has an getLock method that', () => {
    let distributedLock: DistributedLock;

    beforeEach(() => {
      distributedLock = new DistributedLock('local');
    });

    it('returns a Lock object', async () => {
      const lockName = 'resource_' + crypto.randomBytes(20).toString('hex');

      const lock = await distributedLock.getLock(lockName, 10000);
      expect(lock).to.be.an.instanceof(Lock);
      expect(lock.key).to.equal(lockName);
      expect(lock.ttl).to.equal(10000);

      await lock.release();
    });
  });
});
