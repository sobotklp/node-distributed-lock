/**
 * LockingFailed is thrown when we were unable to acquire the lock
 */
export class LockingFailed extends Error {}

/**
 * InvalidArgumentError is thrown when passing an invalid value when creating a new DistributedLock object
 */
export class InvalidArgumentError extends Error {}
