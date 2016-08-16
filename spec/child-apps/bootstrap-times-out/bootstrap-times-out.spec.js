const appLocation = `/base/spec/child-apps/bootstrap-times-out/bootstrap-times-out.app.js`;

export default function() {
	describe(`bootstrap-times-out`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication(appLocation, location => location.hash === "#bootstrap-times-out");
		});

		beforeEach(done => {
			location.hash = '#bootstrap-times-out';

			System
			.import(appLocation)
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`is just waited for if dieOnTimeout is false`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.wasBootstrapped()).toEqual(true);
				expect(childApp.wasMounted()).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual([appLocation]);
				expect(singleSpa.getAppStatus(appLocation)).toEqual(singleSpa.MOUNTED);
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
}
