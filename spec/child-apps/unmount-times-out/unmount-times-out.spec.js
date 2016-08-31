const activeHash = `#unmount-times-out`;

export default function() {
	describe(`unmount-times-out app`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication('./unmount-times-out.app.js', () => System.import('./unmount-times-out.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import('./unmount-times-out.app.js')
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
				expect(singleSpa.getMountedApps()).toEqual(['./unmount-times-out.app.js']);
				expect(singleSpa.getAppStatus('./unmount-times-out.app.js')).toEqual('MOUNTED');

				location.hash = '#not-unmount-times-out';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(childApp.numUnmounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus('./unmount-times-out.app.js')).toEqual('NOT_MOUNTED');
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
