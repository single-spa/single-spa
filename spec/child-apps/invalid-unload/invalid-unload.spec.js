const activeHash = `#invalid-unload`;

export default function() {
	describe(`invalid-unload app :`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication('./invalid-unload.app.js', () => System.import('./invalid-unload.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = '';

			System
			.import('./invalid-unload.app.js')
			.then(app => childApp = app)
			.then(() => singleSpa.unloadChildApplication('./invalid-unload.app.js'))
			.then(() => singleSpa.triggerAppChange())
			.then(() => childApp.reset())
			.then(done)
			.catch(err => console.error(err))
		});

		it(`throws an error if you call unloadChildApplication incorrectly`, () => {
			try {
				// The parameters are in the reverse order
				singleSpa.unloadChildApplication({waitForUnmount}, './invalid-unload.app.js');
				fail("Calling unloadChildApplication with incorrect params should throw");
			} catch(err) {
				// expected
			}

			try {
				// Trying to unload an app that doesn't exist
				singleSpa.unloadChildApplication("App that doesn't exist");
				fail("Calling unloadChildApplication on non-existent app should throw");
			} catch(err) {
				// expected
			}
		});

		it(`puts the app into SKIP_BECAUSE_BROKEN because it has an incorrect unload lifecycle`, done => {
			location.hash = activeHash;
			singleSpa.triggerAppChange().then(() => {
				// The unload lifecycle hasn't been called yet, so single-spa doesn't know it is a bad impl yet.
				expect(singleSpa.getAppStatus('./invalid-unload.app.js')).toBe('MOUNTED');
				return singleSpa.unloadChildApplication('./invalid-unload.app.js');
			})
			.then(() => {
				fail(`unloadChildApplication() should have rejected the promise it returned because the app has a bad implementation of the unload lifecycle`);
				done();
			})
			.catch(err => {
				// Now the unload lifecycle has been called and has been determined to be invalid
				expect(singleSpa.getAppStatus('./invalid-unload.app.js')).toBe('SKIP_BECAUSE_BROKEN');
				done();
			});
		});
	});
}
