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
		})

	});
}


exports.getTests = getTests;