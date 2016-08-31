const activeHash = `#multiple-lifecycle-functions`;

export default function() {
	describe(`multiple-lifecycle-functions app`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.declareChildApplication('./multiple-lifecycle-functions.app.js', () => System.import('./multiple-lifecycle-functions.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			System
			.import('./multiple-lifecycle-functions.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		it(`waits for each of the functions one by one, in order`, (done) => {
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childApp.bootstrapsCalledOutOfOrder()).toEqual(undefined);
				expect(childApp.bootstrap1Called()).toEqual(true);
				expect(childApp.bootstrap2Called()).toEqual(true);
				expect(childApp.bootstrap3Called()).toEqual(true);

				expect(childApp.mountsCalledOutOfOrder()).toEqual(undefined);
				expect(childApp.mount1Called()).toEqual(true);
				expect(childApp.mount2Called()).toEqual(true);
				expect(childApp.mount3Called()).toEqual(true);

				location.hash = '#not-multiple-lifecycle-functions';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(childApp.unmountsCalledOutOfOrder()).toEqual(undefined);

					expect(childApp.unmount1Called()).toEqual(true);
					expect(childApp.unmount2Called()).toEqual(true);
					expect(childApp.unmount3Called()).toEqual(true);

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
