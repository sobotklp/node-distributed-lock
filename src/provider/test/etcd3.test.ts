import { expect } from 'chai';
import * as crypto from 'crypto';
import { Etcd3 } from 'etcd3';
import { Etcd3Provider } from '../etcd3.js';

describe('Etcd3Provider', () => {
  let client: Etcd3;
  let provider: Etcd3Provider;

  beforeEach(async () => {
    client = new Etcd3({
      hosts: ['localhost:2379'],
    });

    provider = new Etcd3Provider(client);
  });

  afterEach(async () => {
    client.close();
  });

  it('locks a given resource', async () => {
    const lockName = 'resource_' + crypto.randomBytes(20).toString('hex');

    const leaseId = await provider.acquire(lockName, 1000);
    expect(leaseId).to.be.a('number');

    // Try to acquire the same lock again - should be rejected
    try {
      await provider.acquire(lockName, 1000);
      throw 'Should not succeed';
    } catch (error) {
      expect(error).to.be.an('string');
      expect(error).to.equal('Already acquired!');
    }
  });

  it('supports monotonically incrementing lease ids ', async () => {
    const lockName = 'resource_' + crypto.randomBytes(20).toString('hex');

    const leaseId1 = await provider.acquire(lockName, 10000);
    expect(leaseId1).to.be.a('number');

    await provider.release(lockName, leaseId1);

    const leaseId2 = await provider.acquire(lockName, 10000);
    expect(leaseId2).to.be.a('number');
    expect(leaseId2).to.be.greaterThan(leaseId1);

    await provider.release(lockName, leaseId2);
  });
});
