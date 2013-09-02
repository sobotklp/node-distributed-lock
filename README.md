# node-distributed-lock

A library for enforcing mutual exclusion of critical sections across multiple processes and machines

[![Build Status](https://travis-ci.org/sobotklp/node-distributed-lock.png?branch=master)](https://travis-ci.org/sobotklp/node-distributed-lock)

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


