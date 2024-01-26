var Lock = function (name, ttl, provider) {
  this.name = name.toString();
  this.ttl = parseInt(ttl, 10);
  this.provider = provider;
};

Lock.prototype.acquire = function (callback) {
  var now = +new Date();

  return this.provider.acquire(this, callback);
};

Lock.prototype.release = function (callback) {
  // Test that the lock has not already been released
  return this.provider.release(this, callback);
};

var LockProviderBase = function (config) {
  this.config = config;

  // LockProvider implementations must have a name.
  this.name = '';
};

/**
 * Get a new Lock object from this LockProvider
 *
 * @param lockName
 * @param {Number} ttl The maximum length of time this lock should be active (in msec)
 * @returns {Lock}
 */
LockProviderBase.prototype.getLock = function (name, ttl) {
  return new Lock(name, ttl, this);
};

LockProviderBase.prototype.acquire = function (lock, callback) {
  return this._acquire(lock, callback);
};

LockProviderBase.prototype.release = function (lock, callback) {
  return this._release(lock, callback);
};

LockProviderBase.prototype.close = function (callback) {
  return this._close(callback);
};

exports.LockProviderBase = LockProviderBase;
