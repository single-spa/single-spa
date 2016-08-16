const appLocation = `/base/spec/child-apps/mount-rejects/mount-rejects.app.js`;
const activeHash = `#mount-rejects`;

export default function() {
	describe(`mount-rejects app`, () => {
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

		it(`bootstraps and mounts, but then is put into SKIP_BECAUSE_BROKEN and never unmounts`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.wasBootstrapped()).toEqual(true);
				expect(childApp.wasMounted()).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

				location.hash = '#not-mount-rejects';
				singleSpa
				.triggerAppChange()
				.then(() => {
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
