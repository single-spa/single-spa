const appLocation = `/base/spec/child-apps/invalid-mount/invalid-mount.app.js`;
const activeHash = `#invalid-mount`;

export default function() {
	describe(`invalid-mount app`, () => {
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

		it(`is bootstrapped and mounted, but then put in a broken state and never unmounted`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.wasBootstrapped()).toEqual(true);
				expect(childApp.wasMounted()).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

				location.hash = 'not-invalid-mount';
				singleSpa
				.triggerAppChange()
				.then(() => {
					// doesn't get unmounted because it's in a broken state.
					expect(childApp.wasUnmounted()).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
					done();
				})
				.catch(ex => {
					fail(ex);
					done();
				});
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
}
