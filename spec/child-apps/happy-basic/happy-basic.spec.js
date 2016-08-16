const appLocation = `/base/spec/child-apps/happy-basic/happy-basic.app.js`;

export default function() {
	describe(`happy-basic`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication(appLocation, location => location.hash === "#happy-basic");
		});

		beforeEach(done => {
			location.hash = '#happy-basic';

			System
			.import(appLocation)
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`goes through the whole lifecycle successfully`, (done) => {
			expect(childApp.isMounted()).toEqual(false);
			expect(singleSpa.getMountedApps()).toEqual([]);

			location.hash = 'happy-basic';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.wasBootstrapped()).toEqual(true);
				expect(childApp.isMounted()).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual([appLocation]);

				location.hash = '#not-happy-basic';

				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(childApp.wasBootstrapped()).toEqual(true);
					expect(childApp.isMounted()).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
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
			})
		});
	});
}
