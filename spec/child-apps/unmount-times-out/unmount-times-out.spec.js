const appLocation = `/base/spec/child-apps/unmount-times-out/unmount-times-out.app.js`;
const activeHash = `#unmount-times-out`;

export default function() {
	describe(`unmount-times-out app`, () => {
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

		it(`is just waited for if dieOnTimeout is false`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.numBootstraps()).toEqual(1);
				expect(childApp.numMounts()).toEqual(1);
				expect(singleSpa.getMountedApps()).toEqual([appLocation]);
				expect(singleSpa.getAppStatus(appLocation)).toEqual('MOUNTED');

				location.hash = '#not-unmount-times-out';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(childApp.numUnmounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('NOT_MOUNTED');
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
