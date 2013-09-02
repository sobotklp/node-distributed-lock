var distributedLock = require('../lib');

function getTests(providerConfig) {
	var provider;

	beforeEach(function (done) {
		provider = distributedLock.getProvider(providerConfig);

		done();
	});

	afterEach(function (done) {
		provider.close(function (error, response) {
			done();
		});
	});

	describe("is a LockProviderBase subclass that ", function () {

		it("has a name attribute", function () {
			expect(provider.name).not.toBeUndefined();
		});

		it("prevents multiple workers from accessing the same critical section", function (done) {
			var count = 0;
			var total = 0;
			var iterations = 50;
			var lock = provider.getLock('critsection', 10000);

			for(var i=0; i<iterations; i++) {
				setTimeout(function () {
					lock.acquire(function (error) {
						expect(error).toBeNull();

						count++;
						total++;

						expect(count).toBe(1);

						// Hold the lock for a bit before releasing it.
						setTimeout(function () {
							count--;

							lock.release();

							if (total == iterations) done();

						}, 2);

					});
				}, 1);
			}

		});

	});
}


exports.getTests = getTests;