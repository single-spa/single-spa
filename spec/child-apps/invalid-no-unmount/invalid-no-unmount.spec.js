const appLocation = `/base/spec/child-apps/invalid-no-unmount/invalid-no-unmount.app.js`;
const activeHash = `#invalid-no-unmount`;

export default function() {
	describe(`invalid-no-unmount app`, () => {
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

		it(`is never bootstrapped`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.isBootstrapped()).toEqual(false);
				expect(childApp.isMounted()).toEqual(false);
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
