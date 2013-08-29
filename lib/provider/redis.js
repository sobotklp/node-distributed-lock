var util = require('util');
var redis = require('redis');

var LockProviderBase = require('./base').LockProviderBase;

var RedisLockProvider = function (config) {
	LockProviderBase.call(this, config);

	this.name = 'redis';

	if (config.redis) {
		if (config.redis instanceof redis.RedisClient) {
			this.client = config.redis;
		}
	} else {
		this.client = redis.createClient();
	}

	return this;
};

/**
 * Inherit from `LockProviderBase`
 */
util.inherits(RedisLockProvider, LockProviderBase);


RedisLockProvider.prototype._acquire = function (lock, callback) {

	var self = this;

	var tryAcquire = function (cb) {
		var now = +new Date();
		var expireAt = now + lock.ttl + 1;

		self.client.setnx(lock.name, expireAt, function (error, wasSet) {

			if (error) return cb(error, null);

			if (wasSet) return cb(null, !!wasSet);

			// The lock is already acquired by another process.

			// Read the lock's expiration time.
			self.client.get(lock.name, function (error, expiresAt) {

				if (error) return cb(error, null);

				var expiresAtNum = parseInt(expiresAt, 10);
				var now = +new Date;

				if (expiresAtNum < now) {
					var expireAt = now + lock.ttl + 1;

					// Lock has expired. Let's try to acquire it
					self.client.getset(lock.name, expireAt, function (error, value) {

						if (error) return cb(error, null);

						// if GETSET returned an expired timestamp, we have acquired the lock.
						var isExpired = (Number(value) < +new Date());

						cb(null, isExpired);

					})
				}

				// Can't acquire the lock yet.
				cb(null, false);

			});

		});
	};

	// If the first tryAcquire fails ...
	var acquireCallback = function (error, acquired) {

		if (error) return callback(error, null);

		if (acquired) return callback(null, lock);

		// Wait and try again.
		setTimeout(function () {
			tryAcquire(acquireCallback);
		}, 100);
	};

	// Try to acquire the lock.
	tryAcquire(acquireCallback);
};

var defaultCallback = function (error, result) {
	if (error) {
		console.log(error.stack);
	}
};

RedisLockProvider.prototype._release = function (lock, callback) {
	var self = this;

	if (!callback) callback = defaultCallback;

	self.client.del(lock.name, function (error) {

		if (error) {
			return callback(error, null)
		} else {
			return callback(null, null);
		}

	});
};

/**
 * Expose as `LockProvider`
 */
exports.LockProvider = RedisLockProvider;

