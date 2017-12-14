export default function() {
	describe(`bootstrap-rejects`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.registerApplication('./bootstrap-rejects.app.js', () => System.import('./bootstrap-rejects.app.js'), location => location.hash === "#bootstrap-rejects");
		});

		beforeEach(done => {
			System
			.import('./bootstrap-rejects.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err});
		})

		it(`puts the app into SKIP_BECAUSE_BROKEN, fires a window event, and doesn't mount it`, done => {
			window.addEventListener("single-spa:application-broken", applicationBroken);
			let applicationBrokenCalled = false;

			location.hash = "#bootstrap-rejects";

			function applicationBroken(evt) {
				applicationBrokenCalled = true;
				expect(evt.detail.appName).toBe('./bootstrap-rejects.app.js');
			}

			singleSpa
			.triggerAppChange()
			.then(() => {
				window.removeEventListener("single-spa:application-broken", applicationBroken);
				expect(applicationBrokenCalled).toBe(true);
				expect(childApp.wasBootstrapped()).toEqual(true);
				expect(childApp.wasMounted()).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('./bootstrap-rejects.app.js')).toEqual(singleSpa.SKIP_BECAUSE_BROKEN);
				done();
			})
			.catch(err => {
				window.removeEventListener("single-spa:application-broken", applicationBroken);
				fail(err);
				done();
			});
		});
	});
}
