import { expect } from 'chai';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

describe('RedisProvider', () => {
  let client: RedisClientType;

  beforeEach(async () => {
    client = createClient(); // Expects redis to be listening on localhost:6379

    client.on('error', (err: Error | undefined) => {
      console.log('Redis Client Error', err);
    });

    await client.connect();
  });

  it('locks a given resource', async () => {
    const result = await client.ping();
    expect(result).to.equal('PONG');
  });
});
