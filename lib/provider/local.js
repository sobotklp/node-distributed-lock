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
	var now = +new Date();
	var expireAt = now + lock.ttl + 1;

	// Acquire the lock if it doesn't exist.
	if (!this.locks[lock.name]) {
		this.locks[lock.name] = expireAt;
	} else {

	}

	// Lock was previously acquired, but has expired.

};

LocalLockProvider.prototype._release = function (lock, callback) {
	this.locks[lock.name] = undefined;

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
