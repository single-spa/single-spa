export default function() {
	describe(`bootstrap-times-out-dies`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication('./bootstrap-times-out-dies.app.js', () => System.import('./bootstrap-times-out-dies.app.js'), location => location.hash === "#bootstrap-times-out-dies");
		});

		beforeEach(done => {
			location.hash = '#bootstrap-times-out-dies';

			System
			.import('./bootstrap-times-out-dies.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`is put into SKIP_BECAUSE_BROKEN if dieOnTimeout is true`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.wasBootstrapped()).toEqual(true);
				expect(childApp.wasMounted()).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('./bootstrap-times-out-dies.app.js')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
}
