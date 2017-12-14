const activeHash = `#invalid-no-bootstrap`;

export default function() {
	describe(`invalid-no-bootstrap app`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.registerApplication('./invalid-no-bootstrap.app.js', () => System.import('./invalid-no-bootstrap.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import('./invalid-no-bootstrap.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`is never mounted`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.isMounted()).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('./invalid-no-bootstrap.app.js')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});

	});
}
