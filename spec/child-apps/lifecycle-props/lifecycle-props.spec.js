const activeHash = `#lifecycle-props`;

export default function() {
	describe(`lifecycle-props app`, () => {
		let childApp;

		beforeAll(() => {
			console.log('declaring child app')
			singleSpa.registerApplication('lifecycle-props', () => System.import('./lifecycle-props.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			System
			.import('./lifecycle-props.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {
				fail(err);
				done();
			});
		});

		it(`is given the correct props for each lifecycle function`, done => {
			// This mounts the app
			window.location.hash = activeHash;

			singleSpa
			.triggerAppChange()
			.then(() => {
				// This unmounts the app
				window.location.hash = `#/no-app`;
				return singleSpa.triggerAppChange();
			})
			.then(() => {
				return singleSpa.unloadApplication('lifecycle-props');
			})
			.then(() => {
				expect(childApp.getBootstrapProps()).toEqual({appName: 'lifecycle-props'});
				expect(childApp.getMountProps()).toEqual({appName: 'lifecycle-props'});
				expect(childApp.getUnmountProps()).toEqual({appName: 'lifecycle-props'});
				expect(childApp.getUnloadProps()).toEqual({appName: 'lifecycle-props'});

				done();
			})
			.catch(err => {
				fail(err);
				done();
			});
		});
	});
}
