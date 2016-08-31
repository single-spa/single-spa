const activeHash = `#uses-loader`;

export default function() {
	describe(`uses-loader app`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication('./uses-loader.app.js', location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import('./uses-loader.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		});

		it(`works just fine if you don't provide a loadImpl function but instead depend on the setLoader`, done => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.bootstrapWasCalled()).toBe(true);
				expect(childApp.mountWasCalled()).toBe(true);
				expect(childApp.unmountWasCalled()).toBe(false);
				expect(singleSpa.getAppStatus('./uses-loader.app.js')).toEqual(singleSpa.MOUNTED);
				done();
			})
			.catch(err => {
				fail(err);
				done();
			});
		});
	});
}
