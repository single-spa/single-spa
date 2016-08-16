const appLocation = `/base/spec/child-apps/invalid-unmount/invalid-unmount.app.js`;
const activeHash = `#invalid-unmount`;

export default function() {
	describe(`invalid-unmount app`, () => {
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

		it(`is bootstrapped, mounted, and unmounted, but then put in a broken state and never again mounted`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.numBootstraps()).toEqual(1);
				expect(childApp.numMounts()).toEqual(1);
				expect(singleSpa.getMountedApps()).toEqual([appLocation]);
				expect(singleSpa.getAppStatus(appLocation)).toEqual('MOUNTED');

				// now unmount, which will be the first time it enters a broken state
				location.hash = '#not-invalid-unmount';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(childApp.numBootstraps()).toEqual(1);
					expect(childApp.numMounts()).toEqual(1);
					expect(childApp.numUnmounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

					// now remount and check if it tries to mount despite being in a broken state
					location.hash = activeHash;
					singleSpa
					.triggerAppChange()
					.then(() => {
						expect(childApp.numBootstraps()).toEqual(1);
						expect(childApp.numMounts()).toEqual(1); // hasn't increased
						expect(childApp.numUnmounts()).toEqual(1);
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
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
}
