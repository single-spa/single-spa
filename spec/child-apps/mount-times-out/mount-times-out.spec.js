const appLocation = `/base/spec/child-apps/mount-times-out/mount-times-out.app.js`;
const activeHash = `#mount-times-out`;

export default function() {
	describe(`mount-times-out app`, () => {
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

		it(`is just waited for if dieOnTimeout is false`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.bootstraps()).toEqual(1);
				expect(childApp.mounts()).toEqual(1);
				expect(singleSpa.getMountedApps()).toEqual([appLocation]);
				expect(singleSpa.getAppStatus(appLocation)).toEqual('MOUNTED');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
}
