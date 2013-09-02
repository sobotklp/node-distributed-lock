describe("The local-process-memory lock provider", function () {
	var providerConfig = {
		provider: 'local'
	};

	// Run full test suite with this provider.
	require('./provider-agnostic').getTests(providerConfig);
});