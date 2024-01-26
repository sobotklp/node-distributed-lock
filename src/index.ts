import { LocalProvider } from './local';
import { Lock } from './lock';

const provider = new LocalProvider();

export function lock(key: string, ttl: number, id?: number): Lock {
  return new Lock(provider, key, ttl, id);
}
