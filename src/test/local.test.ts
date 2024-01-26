import { expect } from 'chai';
import { LocalProvider } from '../local.js';

describe('LocalProvider', () => {
  let provider: LocalProvider;
  beforeEach(() => {
    provider = new LocalProvider();
  });

  it('locks a given resource', async () => {
    const leaseId = await provider.acquire('resource', 1000);
    expect(leaseId).to.equal(1);

    // Try to acquire the same lock again - should be rejected
    try {
      await provider.acquire('resource', 1000);
      throw 'Should not succeed';
    } catch (error) {
      expect(error).to.be.an('string');
      expect(error).to.equal('Already acquired with lease id 1!');
    }
  });

  it('release unlocks a resource', async () => {
    const lease1 = await provider.acquire('resource', 1000);
    expect(lease1).to.equal(1);

    const result = await provider.release('resource');
    expect(result).to.equal(undefined);

    // Now, can acquire the lock again
    const lease2 = await provider.acquire('resource', 1000);
    expect(lease2).to.equal(1);
  });
});
