export default function() {
	describe(`bootstrap-rejects`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication('./bootstrap-rejects.app.js', () => System.import('./bootstrap-rejects.app.js'), location => location.hash === "#bootstrap-rejects");
		});

		beforeEach(done => {
			location.hash = "#bootstrap-rejects";

			System
			.import('./bootstrap-rejects.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err});
		})

		it(`puts the modules into SKIP_BECAUSE_BROKEN and doesn't mount it`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.wasBootstrapped()).toEqual(true);
				expect(childApp.wasMounted()).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('./bootstrap-rejects.app.js')).toEqual(singleSpa.SKIP_BECAUSE_BROKEN);
				done();
			})
			.catch(fail);
		});
	});
}
