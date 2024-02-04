import { expect } from 'chai';
import * as crypto from 'crypto';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';
import { LockingFailed } from '../../errors.js';
import { RedisProvider } from '../redis.js';

describe('RedisProvider', () => {
  let client: RedisClientType;
  let provider: RedisProvider;

  beforeEach(async () => {
    client = createClient(); // Expects redis to be listening on localhost:6379

    client.on('error', (err: Error | undefined) => {
      console.log('Redis Client Error', err);
    });

    await client.connect();

    provider = new RedisProvider(client);
  });

  it('locks a given resource', async () => {
    const lockName = 'resource_' + crypto.randomBytes(20).toString('hex');

    const leaseId = await provider.acquire(lockName, 1000);
    expect(leaseId).to.equal(1);

    // Try to acquire the same lock again - should be rejected
    try {
      await provider.acquire(lockName, 1000);
      throw 'Should not succeed';
    } catch (error) {
      expect(error).to.be.an.instanceOf(LockingFailed);
      expect(error.message).to.equal('Lock is already acquired');
    }
  });

  it('release unlocks a resource', async () => {
    const lockName = 'resource_' + crypto.randomBytes(20).toString('hex');

    const lease1 = await provider.acquire(lockName, 1000);
    expect(lease1).to.equal(1);

    const result = await provider.release(lockName, lease1);
    expect(result).to.equal(undefined);

    // Now, can acquire the lock again
    const lease2 = await provider.acquire(lockName, 1000);
    expect(lease2).to.equal(2);
  });

  it('release fails if the incorrect leaseId is given', async () => {
    const lockName = 'resource_' + crypto.randomBytes(20).toString('hex');

    const lease1 = await provider.acquire(lockName, 1000);
    expect(lease1).to.equal(1);

    try {
      await provider.release(lockName, 666);
      throw 'Should not succeed';
    } catch (error) {
      expect(error).to.be.an.instanceof(ReferenceError);
      expect(error.message).to.equal('Wrong leaseId given');
    }
  });
});
