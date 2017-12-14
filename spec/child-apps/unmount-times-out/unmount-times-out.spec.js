const activeHash = `#unmount-times-out`;

export default function() {
	describe(`unmount-times-out app`, () => {
		let childApp, ogJasmineTimeout;

		beforeAll(() => {
			singleSpa.registerApplication('./unmount-times-out.app.js', () => System.import('./unmount-times-out.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = activeHash;

			/* See http://jasmine.github.io/2.1/introduction.html#section-Asynchronous_Support.
			 * Sometimes saucelabs is so slow on this test that jasmine times out
			 */
			ogJasmineTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

			System
			.import('./unmount-times-out.app.js')
			.then(app => childApp = app)
			.then(app => app.reset())
			.then(done)
			.catch(err => {throw err})
		})

		afterEach(() => {
			jasmine.DEFAULT_TIMEOUT_INTERVAL = ogJasmineTimeout;
		});

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
