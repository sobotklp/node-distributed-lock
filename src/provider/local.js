/**
 * Implements a lock broker using local Nodejs process memory.
 * WARNING: This is suitable for testing purposes only and should not be used in production.
 */
var util = require('util');

var LockProviderBase = require('./base').LockProviderBase;

var LocalLockProvider = function (config) {
  LockProviderBase.call(this, config);

  this.name = 'local';
  this.locks = {};
  return this;
};

/**
 * Inherit from `LockProviderBase`
 */
util.inherits(LocalLockProvider, LockProviderBase);

LocalLockProvider.prototype._acquire = function (lock, callback) {
  var self = this;

  var tryAcquire = function (cb) {
    var now = +new Date();
    var expireAt = now + lock.ttl + 1;

    // Acquire the lock if it doesn't exist.
    if (!self.locks[lock.name]) {
      self.locks[lock.name] = expireAt;

      cb(null, true);
    } else {
      // Check if lock has expired.
      var now = +new Date();
      if (self.locks[lock.name] < now) {
        // Then we acquire it.
        self.locks[lock.name] = expireAt;

        cb(null, true);
      } else {
        // Couldn't acquire lock yet.
        cb(null, false);
      }
    }
  };

  // If the first tryAcquire fails ...
  var acquireCallback = function (error, acquired) {
    if (error) return callback(error, null);

    if (acquired) return callback(null, lock);

    // Wait and try again.
    setTimeout(function () {
      tryAcquire(acquireCallback);
    }, 10);
  };

  // Try to acquire the lock.
  tryAcquire(acquireCallback);
};

LocalLockProvider.prototype._release = function (lock, callback) {
  delete this.locks[lock.name];

  if (callback) callback(null, lock);
};

LocalLockProvider.prototype._close = function (callback) {
  // Noop
  if (callback) callback();
};

/**
 * Expose as `LockProvider`
 */
exports.LockProvider = LocalLockProvider;
