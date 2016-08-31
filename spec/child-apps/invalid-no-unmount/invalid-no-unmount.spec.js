const activeHash = `#invalid-no-unmount`;

export default function() {
	describe(`invalid-no-unmount app`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication('./invalid-no-unmount.app.js', () => System.import('./invalid-no-unmount.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import('./invalid-no-unmount.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`is never bootstrapped`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.isBootstrapped()).toEqual(false);
				expect(childApp.isMounted()).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('./invalid-no-unmount.app.js')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
}
