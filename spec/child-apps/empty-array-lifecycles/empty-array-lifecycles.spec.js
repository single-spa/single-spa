const appLocation = `/base/spec/child-apps/empty-array-lifecycles/empty-array-lifecycles.app.js`;

export default function() {
	describe(`empty-array-lifecycles`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication(appLocation, location => location.hash === "#empty-array-lifecycles");
		});

		beforeEach(done => {
			location.hash = '#empty-array-lifecycles';

			System
			.import(appLocation)
			.then(app => childApp = app)
			.then(done)
			.catch(err => {throw err})
		})

		it(`works just fine even though it's got empty arrays`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(singleSpa.getMountedApps()).toEqual([appLocation]);

				location.hash = '#not-empty-array-lifecycles';

				singleSpa
				.triggerAppChange()
				.then(() => {
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
