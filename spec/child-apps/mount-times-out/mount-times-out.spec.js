const activeHash = `#mount-times-out`;

export default function() {
	describe(`mount-times-out app`, () => {
		let myApp;

		beforeAll(() => {
			singleSpa.registerApplication('./mount-times-out.app.js', () => System.import('./mount-times-out.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import('./mount-times-out.app.js')
			.then(app => myApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`is just waited for if dieOnTimeout is false`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(myApp.bootstraps()).toEqual(1);
				expect(myApp.mounts()).toEqual(1);
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
