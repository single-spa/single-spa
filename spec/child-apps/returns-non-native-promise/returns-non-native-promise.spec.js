export default function() {
	describe(`returns-non-native-promise`, () => {
		let myApp;

		beforeAll(() => {
			singleSpa.registerApplication('./returns-non-native-promise.app.js', () => System.import('./returns-non-native-promise.app.js'), location => location.hash === "#returns-non-native-promise");
		});

		beforeEach(done => {
			location.hash = '#returns-non-native-promise';

			System
			.import('./returns-non-native-promise.app.js')
			.then(app => myApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		});

		it(`goes through the whole lifecycle successfully`, done => {
			expect(myApp.wasMounted()).toEqual(false);
			expect(singleSpa.getMountedApps()).toEqual([]);

			location.hash = '#returns-non-native-promise';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(myApp.wasBootstrapped()).toEqual(true);
				expect(myApp.wasMounted()).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual(['./returns-non-native-promise.app.js']);

				location.hash = '#something-else';

				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(myApp.wasBootstrapped()).toEqual(true);
					expect(myApp.wasUnmounted()).toEqual(true);
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

		})
	});
}
