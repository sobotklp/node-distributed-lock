var path = require('path');

var defaultConfig = {
  provider: 'local',
};

function getProvider(options) {
  var providerName = options.provider || 'redis';

  try {
    var module = require(path.join('../lib/provider', providerName));
  } catch (error) {
    throw new Error("node-distributed-lock: Invalid lock provider '" + providerName + "'");
  }

  return new module.LockProvider(options);
}

function getLock(lockName, lifeTime) {
  return _provider.getLock(lockName, lifeTime);
}

var _provider = getProvider(defaultConfig);

exports.getProvider = getProvider;
exports.getLock = getLock;
