export default function() {
	describe(`empty-array-lifecycles`, () => {
		let myApp;

		beforeAll(() => {
			singleSpa.registerApplication('./empty-array-lifecycles.app.js', () => System.import('./empty-array-lifecycles.app.js'), location => location.hash === "#empty-array-lifecycles");
		});

		beforeEach(done => {
			location.hash = '#empty-array-lifecycles';

			System
			.import('./empty-array-lifecycles.app.js')
			.then(app => myApp = app)
			.then(done)
			.catch(err => {throw err})
		})

		it(`works just fine even though it's got empty arrays`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(singleSpa.getMountedApps()).toEqual(['./empty-array-lifecycles.app.js']);

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
