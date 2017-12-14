const activeHash = `#happy-unload`;

export default function() {
	describe(`happy-unload app :`, () => {
		let childApp;

		beforeAll(() => {
			singleSpa.registerApplication('./happy-unload.app.js', () => System.import('./happy-unload.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = '';

			System
			.import('./happy-unload.app.js')
			.then(app => childApp = app)
			.then(() => singleSpa.unloadChildApplication('./happy-unload.app.js'))
			.then(() => singleSpa.triggerAppChange())
			.then(() => childApp.reset())
			.then(done)
			.catch(err => console.error(err))
		})

		describe(`when waitForUnmount = false :`, () => {
			it(`unloads an app that is mounted, and then remounts it`, done => {
				location.hash = activeHash;

				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(0);
					expect(childApp.getNumUnloadCalls()).toBe(0);
					return singleSpa.unloadChildApplication('./happy-unload.app.js');
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(1);
					expect(childApp.getNumUnloadCalls()).toBe(1);
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(2);
					expect(childApp.getNumMountCalls()).toBe(2);
					expect(childApp.getNumUnmountCalls()).toBe(1);
					expect(childApp.getNumUnloadCalls()).toBe(1);
					done();
				})
				.catch(ex => {
					fail(ex);
					done();
				});
			});

			it(`unloads an app that isn't loaded, and then keeps it in NOT_LOADED status`, done => {
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(childApp.getNumBootstrapCalls()).toBe(0);
					expect(childApp.getNumMountCalls()).toBe(0);
					expect(childApp.getNumUnmountCalls()).toBe(0);
					expect(childApp.getNumUnloadCalls()).toBe(0);

					window.location.hash = activeHash;
					return singleSpa.triggerAppChange()
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(0);
					expect(childApp.getNumUnloadCalls()).toBe(0);

					window.location.hash = '#';
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(1);
					expect(childApp.getNumUnloadCalls()).toBe(0);
					return singleSpa.unloadChildApplication('./happy-unload.app.js');
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(1);
					expect(childApp.getNumUnloadCalls()).toBe(1);
					done();
				})
				.catch(err => {
					fail(err);
					done();
				});
			});

			it(`is a no-op if the app is NOT_LOADED when you call unloadChildApplication on it`, done => {
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(childApp.getNumBootstrapCalls()).toBe(0);
					expect(childApp.getNumMountCalls()).toBe(0);
					expect(childApp.getNumUnmountCalls()).toBe(0);
					expect(childApp.getNumUnloadCalls()).toBe(0);
				})
				.then(() => singleSpa.unloadChildApplication('./happy-unload.app.js'))
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(childApp.getNumBootstrapCalls()).toBe(0);
					expect(childApp.getNumMountCalls()).toBe(0);
					expect(childApp.getNumUnmountCalls()).toBe(0);
					expect(childApp.getNumUnloadCalls()).toBe(0);

					done();
				})
				.catch(err => {
					fail(err);
					done();
				});
			});

			it(`immediately unloads apps in NOT_MOUNTED status, and then puts them into NOT_LOADED status (ready for next time they are activated)`, done => {
				window.location.hash = activeHash;

				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(0);
					expect(childApp.getNumUnloadCalls()).toBe(0);

					window.location.hash = '#';
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(1);
					expect(childApp.getNumUnloadCalls()).toBe(0);
					return singleSpa.unloadChildApplication('./happy-unload.app.js');
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(1);
					expect(childApp.getNumUnloadCalls()).toBe(1);

					window.location.hash = activeHash;
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(2);
					expect(childApp.getNumMountCalls()).toBe(2);
					expect(childApp.getNumUnmountCalls()).toBe(1);
					expect(childApp.getNumUnloadCalls()).toBe(1);

					done();
				})
				.catch(err => {
					fail(err);
					done();
				});
			});
		});

		describe(`when waitForUnmount = true :`, () => {
			it(`delays unloading the app until the app is no longer active`, done => {
				window.location.hash = activeHash;

				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(0);
					expect(childApp.getNumUnloadCalls()).toBe(0);

					singleSpa
					.unloadChildApplication('./happy-unload.app.js', {waitForUnmount: true})
					.then(() => {
						/* This will get called only once the app is unloaded. And it will not
						 * wait for the app to get remounted before it is called.
						 */
						expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');

						expect(childApp.getNumBootstrapCalls()).toBe(1);
						expect(childApp.getNumMountCalls()).toBe(1);
						expect(childApp.getNumUnmountCalls()).toBe(1);
						expect(childApp.getNumUnloadCalls()).toBe(1);
					})
					.catch(err => {
						fail(err);
						done();
					})

					/* Triggering an app change after calling unloadChildApplication will
					 * not cause the app to unload, since it is still mounted and we set
					 * waitForUnmount: true.
					 */
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(0);
					expect(childApp.getNumUnloadCalls()).toBe(0);

					window.location.hash = `#`;
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(childApp.getNumBootstrapCalls()).toBe(1);
					expect(childApp.getNumMountCalls()).toBe(1);
					expect(childApp.getNumUnmountCalls()).toBe(1);
					expect(childApp.getNumUnloadCalls()).toBe(1);
					done();
				})
				.catch(err => {
					fail(err);
					done();
				});
			});
		});

		it(`resolves the promise for all callers to unloadChildApplication when the app is unloaded`, done => {
			window.location.hash = activeHash;

			let firstCallerResolved = false, secondCallerResolved = false;

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
				expect(childApp.getNumBootstrapCalls()).toBe(1);
				expect(childApp.getNumMountCalls()).toBe(1);
				expect(childApp.getNumUnmountCalls()).toBe(0);
				expect(childApp.getNumUnloadCalls()).toBe(0);
			})
			.then(() => {
				// First caller to unloadChildApplication wants to waitForUnmount
				singleSpa
				.unloadChildApplication('./happy-unload.app.js', {waitForUnmount: true})
				.then(() => {
					firstCallerResolved = true;
					if (secondCallerResolved) {
						// Both callers had their promises resolved!
						done();
					}
				})
				.catch(err => {
					fail(err);
					done();
				});

				// Second caller to unloadChildApplication doesn't want to waitForUnmount
				singleSpa
				.unloadChildApplication('./happy-unload.app.js', {waitForUnmount: false})
				.then(() => {
					secondCallerResolved = true;
					if (firstCallerResolved) {
						// Both callers had their promises resolved!
						done();
					}
				})
				.catch(err => {
					fail(err);
					done();
				})
			})
			.catch(err => {
				fail(err);
				done();
			});
		});
	});
}
