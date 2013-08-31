describe("The redis backend", function () {
	var distributedLock = require('../lib');
	var redis = require('redis');
	var provider;
	var redisClient;

	beforeEach(function (done) {
		redisClient = redis.createClient();

		provider = distributedLock.getProvider({
			provider: 'redis',
			redis: redisClient
		});

		done();
	});

	afterEach(function (done) {
		redisClient.quit(function (error, response) {
			done();
		});
	});

	it("supports locking by name", function (done) {
		// Get lock with a 10-second TTL
		var lock = provider.getLock('test1', 10000);

		spyOn(redisClient, 'setnx').andCallThrough();
		spyOn(redisClient, 'get').andCallThrough();
		spyOn(redisClient, 'getset').andCallThrough();
		spyOn(redisClient, 'del').andCallThrough();

		lock.acquire(function (error) {
			expect(error).toBeNull();

			expect(redisClient.setnx).toHaveBeenCalledWith('test1', jasmine.any(Number), jasmine.any(Function));
			expect(redisClient.del).not.toHaveBeenCalled();
			expect(redisClient.get).not.toHaveBeenCalled();
			expect(redisClient.getset).not.toHaveBeenCalled();

			lock.release(function (error, result) {
				expect(error).toBeNull();

				expect(redisClient.del).toHaveBeenCalledWith('test1', jasmine.any(Function));
				done();
			});
		});
	});

	it("locks properly", function (done) {
		// Get lock with a 400-ms TTL
		var lock = provider.getLock('test2', 400);

		spyOn(redisClient, 'setnx').andCallThrough();
		spyOn(redisClient, 'get').andCallThrough();
		spyOn(redisClient, 'getset').andCallThrough();
		spyOn(redisClient, 'del').andCallThrough();

		// Acquire the lock for the first time.
		lock.acquire(function (error) {
			expect(error).toBeNull();

			expect(redisClient.setnx).toHaveBeenCalledWith('test2', jasmine.any(Number), jasmine.any(Function));
			expect(redisClient.del).not.toHaveBeenCalled();
			expect(redisClient.get).not.toHaveBeenCalled();
			expect(redisClient.getset).not.toHaveBeenCalled();

			// Try to acquire the lock again. Should block until the first acquire() times out.
			lock.acquire(function (error) {
				expect(error).toBeNull();

				expect(redisClient.setnx).toHaveBeenCalledWith('test2', jasmine.any(Number), jasmine.any(Function));
				expect(redisClient.del).not.toHaveBeenCalled();
				expect(redisClient.get).toHaveBeenCalledWith('test2', jasmine.any(Function));
				expect(redisClient.getset).toHaveBeenCalledWith('test2', jasmine.any(Number), jasmine.any(Function));

				lock.release(function (error, result) {
					expect(error).toBeNull();

					expect(redisClient.del).toHaveBeenCalledWith('test2', jasmine.any(Function));
					done();
				});
			});
		});
	});
});

