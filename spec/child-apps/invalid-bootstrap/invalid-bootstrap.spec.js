const appLocation = `/base/spec/child-apps/invalid-bootstrap/invalid-bootstrap.app.js`;
const activeHash = `#invalid-bootstrap`;

export default function() {
	describe(`invalid-bootstrap app`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication(appLocation, location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import(appLocation)
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`is never bootstrapped, mounted, or unmounted`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.mountWasCalled()).toEqual(false);
				expect(childApp.unmountWasCalled()).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});

	});
}
