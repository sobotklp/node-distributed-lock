# node-distributed-lock

_A library for enforcing mutual exclusion of critical sections across multiple processes_

[![Build](https://github.com/sobotklp/node-distributed-lock/actions/workflows/ci.yml/badge.svg)](https://github.com/sobotklp/node-distributed-lock/actions/workflows/ci.yml)

Features and functionality:

- Supports multiple backends for creating locks, including Redis and etcd3
- Monotonically increasing ids, can be used for fencing/checking causality violations

## Installation

    $ npm install distributed-lock

## Usage with Redis

    var redis = require('redis');
    var redisClient = redis.createClient();

    var distributedLock = require('distributed-lock')

    var lockProvider = distributedLock.getProvider({
        name: 'redis',
        redis: redisClient
    });

    // Get a lock with name 'duckDuckGoose' with a time-to-live of 1 minute
    var lock = lockProvider.getLock('duckDuckGoose', 60000);
    lock.acquire(function (error, lock) {

    	if (error) {
    		console.log("ERROR OCCURRED!", error);
    		return;
    	}

    	// Critical section
    	// ...
    	// End criticial section

    	lock.release();
    });

## Resources

- (https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)[Martin Kleppmann's blog post on distributed locking]
