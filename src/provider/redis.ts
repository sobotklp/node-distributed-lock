import * as crypto from 'crypto';
import { LockingFailed } from '../errors.js';
import { ILockProvider, LeaseID } from './base';

const ACQUIRE_SCRIPT = `
local vals = redis.call('HMGET', KEYS[1], 'acquired', 'expireAt', 'leaseId')
local time = redis.call('TIME')
local now = tonumber(time[1] .. "." .. time[2])

-- If we've seen this lock before
if vals[1] then

  -- if so, is it currently acquired?
  if vals[1] ~= '0' and now < tonumber(vals[2]) then
    return -1
  end

end

local expireAt = now + tonumber(ARGV[1])
local leaseId = 1
if tonumber(vals[3]) then
  leaseId = tonumber(vals[3]) + 1
end

redis.call('HMSET', KEYS[1], 'expireAt', expireAt, 'acquired', '10', 'leaseId', leaseId)

return leaseId
`;

const ACQUIRE_SHA = crypto.createHash('sha1').update(ACQUIRE_SCRIPT).digest('hex');

const RELEASE_SCRIPT = `
local vals = redis.call('HMGET', KEYS[1], 'acquired', 'expireAt', 'leaseId')

-- If the lock exists,
if vals[1] then

  -- check that the leaseId given matches the existing value
  if vals[3] ~= ARGV[1] then
    return -1
  end
  
  redis.call('HMSET', KEYS[1], 'acquired', '0')
end

return 0
`;

const RELEASE_SHA = crypto.createHash('sha1').update(RELEASE_SCRIPT).digest('hex');

export class RedisProvider implements ILockProvider {
  constructor(
    private redisClient: any,
    private keyPrefix: string = 'node-distributed-lock/',
  ) {}

  public acquire(key: string, ttl: number, id?: number): Promise<LeaseID> {
    const redisKey = this.keyPrefix + key;
    const args: Array<string> = [ttl.toString(), id ? id.toString() : ''];

    return this.redisClient
      .evalSha(ACQUIRE_SHA, {
        keys: [redisKey],
        arguments: args,
      })
      .catch((err: Error) => {
        console.log(err); // TODO: Remove me

        // If the script hasn't been loaded yet, use the regular EVAL function.
        // It will then be usable by evalSha for subsequent requests
        if (err.message == 'NOSCRIPT No matching script. Please use EVAL.') {
          return this.redisClient.eval(ACQUIRE_SCRIPT, {
            keys: [redisKey],
            arguments: args,
          });
        }

        // Re-throw other errors
        throw err;
      })
      .then((reply: string) => {
        // Lock was already acquired
        if (reply == '-1') {
          return Promise.reject(new LockingFailed(`Lock is already acquired`));
        }

        return reply;
      });
  }

  public flush(): Promise<void> {
    // Deliberately not implemented
    return Promise.resolve();
  }

  public release(key: string, leaseId: number): Promise<void> {
    const redisKey = this.keyPrefix + key;
    const args: Array<string> = [leaseId.toString()];

    return this.redisClient
      .evalSha(RELEASE_SHA, {
        keys: [redisKey],
        arguments: args,
      })
      .catch((err: Error) => {
        console.log(err); // TODO: Remove me

        // If the script hasn't been loaded yet, use the regular EVAL function.
        // It will then be usable by evalSha for subsequent requests
        if (err.message == 'NOSCRIPT No matching script. Please use EVAL.') {
          return this.redisClient.eval(RELEASE_SCRIPT, {
            keys: [redisKey],
            arguments: args,
          });
        }

        // Re-throw other errors
        throw err;
      })
      .then((reply: string) => {
        // Wrong leaseId was given
        if (reply == '-1') {
          return Promise.reject(new ReferenceError('Wrong leaseId given'));
        }

        return undefined;
      });
  }
}
