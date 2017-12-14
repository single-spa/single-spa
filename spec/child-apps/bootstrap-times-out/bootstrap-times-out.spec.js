export default function() {
	describe(`bootstrap-times-out`, () => {
		let myApp;

		beforeAll(() => {
			singleSpa.registerApplication('./bootstrap-times-out.app.js', () => System.import('./bootstrap-times-out.app.js'), location => location.hash === "#bootstrap-times-out");
		});

		beforeEach(done => {
			location.hash = '#bootstrap-times-out';

			System
			.import('./bootstrap-times-out.app.js')
			.then(app => myApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`is just waited for if dieOnTimeout is false`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(myApp.wasBootstrapped()).toEqual(true);
				expect(myApp.wasMounted()).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual(['./bootstrap-times-out.app.js']);
				expect(singleSpa.getAppStatus('./bootstrap-times-out.app.js')).toEqual(singleSpa.MOUNTED);
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
}
