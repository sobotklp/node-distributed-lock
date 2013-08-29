var util = require('util');

var LockProviderBase = require('./base').LockProviderBase;

var LocalLockProvider = function (config) {
	LockProviderBase.call(this, config);

	this.name = 'local';

	return this;
};

/**
 * Inherit from `LockProviderBase`
 */
util.inherits(LocalLockProvider, LockProviderBase);


LocalLockProvider.prototype._acquire = function (lock, callback) {

	var self = this;

};

LocalLockProvider.prototype._release = function (lock, callback) {
	var self = this;
};

/**
 * Expose as `LockProvider`
 */
exports.LockProvider = LocalLockProvider;
