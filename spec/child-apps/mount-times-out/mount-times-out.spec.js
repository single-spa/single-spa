const activeHash = `#mount-times-out`;

export default function() {
	describe(`mount-times-out app`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.registerApplication('./mount-times-out.app.js', () => System.import('./mount-times-out.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import('./mount-times-out.app.js')
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
				expect(singleSpa.getMountedApps()).toEqual(['./mount-times-out.app.js']);
				expect(singleSpa.getAppStatus('./mount-times-out.app.js')).toEqual('MOUNTED');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
}
