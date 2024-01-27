import { Lock } from './lock';
import { LocalProvider } from './provider/local';

const provider = new LocalProvider();

export function lock(key: string, ttl: number, id?: number): Lock {
  return new Lock(provider, key, ttl, id);
}
