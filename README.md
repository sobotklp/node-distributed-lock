# node-distributed-lock

_A library for enforcing mutual exclusion of critical sections across multiple processes_

[![Build](https://github.com/sobotklp/node-distributed-lock/actions/workflows/ci.yml/badge.svg)](https://github.com/sobotklp/node-distributed-lock/actions/workflows/ci.yml)

Features and functionality:

- Supports multiple backends for creating locks, including Redis and etcd3
- Monotonically increasing ids, can be used for fencing/checking causality violations

## A word on reliability of distributed locking

Though it's common to think of a distributed lock as a reliable device for ensuring mutual exclusion within a distributed system, there are edge cases that can cause a lock to be acquired by two (or more) processes. For example,

- In Redis, due to asynchronous replication it's possible for a lock to be lost if a server crashes before the lock data is replicated to a secondary.
- Heartbeat-based sessions such as etcd3 leases rely on both the client and the server agreeing that a client holds the lease. Heartbeat-based sessions can be interrupted by stop-the-world garbage collection pauses, long-running synchronous operations, and other issues.

Therefore, it's misleading to assume that a distributed lock is as reliable as an OS mutex object.
If the correctness of your use case depends highly on mutual exclusion, it's recommended to use a
monotonically increasing fencing token (aka revision number) to protect from writing stale data.

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
