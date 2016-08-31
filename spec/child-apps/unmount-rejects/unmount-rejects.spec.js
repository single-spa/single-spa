const activeHash = `#unmount-rejects`;

export default function() {
	describe(`mount-rejects app`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication('./unmount-rejects.app.js', () => System.import('./unmount-rejects.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import('./unmount-rejects.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`bootstraps and mounts, but then is put into SKIP_BECAUSE_BROKEN once it unmounts`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.numBootstraps()).toEqual(1);
				expect(childApp.numMounts()).toEqual(1);
				expect(childApp.numUnmounts()).toEqual(0);
				expect(singleSpa.getMountedApps()).toEqual(['./unmount-rejects.app.js']);
				expect(singleSpa.getAppStatus('./unmount-rejects.app.js')).toEqual('MOUNTED');

				location.hash = '#not-unmount-rejects';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(childApp.numUnmounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus('./unmount-rejects.app.js')).toEqual('SKIP_BECAUSE_BROKEN');

					location.hash = '#unmount-rejects';
					singleSpa
					.triggerAppChange()
					.then(() => {
						// it shouldn't be mounted again
						expect(childApp.numMounts()).toEqual(1);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus('./unmount-rejects.app.js')).toEqual('SKIP_BECAUSE_BROKEN');

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
