const activeHash = `#happy-unload`;

export default function() {
	describe(`happy-unload app :`, () => {
		let myApp;

		beforeAll(() => {
			singleSpa.registerApplication('./happy-unload.app.js', () => System.import('./happy-unload.app.js'), location => location.hash === activeHash);
		});

		beforeEach(done => {
			location.hash = '';

			System
			.import('./happy-unload.app.js')
			.then(app => myApp = app)
			.then(() => singleSpa.unloadApplication('./happy-unload.app.js'))
			.then(() => singleSpa.triggerAppChange())
			.then(() => myApp.reset())
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
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(0);
					expect(myApp.getNumUnloadCalls()).toBe(0);
					return singleSpa.unloadApplication('./happy-unload.app.js');
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(1);
					expect(myApp.getNumUnloadCalls()).toBe(1);
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(myApp.getNumBootstrapCalls()).toBe(2);
					expect(myApp.getNumMountCalls()).toBe(2);
					expect(myApp.getNumUnmountCalls()).toBe(1);
					expect(myApp.getNumUnloadCalls()).toBe(1);
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
					expect(myApp.getNumBootstrapCalls()).toBe(0);
					expect(myApp.getNumMountCalls()).toBe(0);
					expect(myApp.getNumUnmountCalls()).toBe(0);
					expect(myApp.getNumUnloadCalls()).toBe(0);

					window.location.hash = activeHash;
					return singleSpa.triggerAppChange()
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(0);
					expect(myApp.getNumUnloadCalls()).toBe(0);

					window.location.hash = '#';
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_MOUNTED');
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(1);
					expect(myApp.getNumUnloadCalls()).toBe(0);
					return singleSpa.unloadApplication('./happy-unload.app.js');
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(1);
					expect(myApp.getNumUnloadCalls()).toBe(1);
					done();
				})
				.catch(err => {
					fail(err);
					done();
				});
			});

			it(`is a no-op if the app is NOT_LOADED when you call unloadApplication on it`, done => {
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(myApp.getNumBootstrapCalls()).toBe(0);
					expect(myApp.getNumMountCalls()).toBe(0);
					expect(myApp.getNumUnmountCalls()).toBe(0);
					expect(myApp.getNumUnloadCalls()).toBe(0);
				})
				.then(() => singleSpa.unloadApplication('./happy-unload.app.js'))
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(myApp.getNumBootstrapCalls()).toBe(0);
					expect(myApp.getNumMountCalls()).toBe(0);
					expect(myApp.getNumUnmountCalls()).toBe(0);
					expect(myApp.getNumUnloadCalls()).toBe(0);

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
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(0);
					expect(myApp.getNumUnloadCalls()).toBe(0);

					window.location.hash = '#';
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_MOUNTED');
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(1);
					expect(myApp.getNumUnloadCalls()).toBe(0);
					return singleSpa.unloadApplication('./happy-unload.app.js');
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(1);
					expect(myApp.getNumUnloadCalls()).toBe(1);

					window.location.hash = activeHash;
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(myApp.getNumBootstrapCalls()).toBe(2);
					expect(myApp.getNumMountCalls()).toBe(2);
					expect(myApp.getNumUnmountCalls()).toBe(1);
					expect(myApp.getNumUnloadCalls()).toBe(1);

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
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(0);
					expect(myApp.getNumUnloadCalls()).toBe(0);

					singleSpa
					.unloadApplication('./happy-unload.app.js', {waitForUnmount: true})
					.then(() => {
						/* This will get called only once the app is unloaded. And it will not
						 * wait for the app to get remounted before it is called.
						 */
						expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');

						expect(myApp.getNumBootstrapCalls()).toBe(1);
						expect(myApp.getNumMountCalls()).toBe(1);
						expect(myApp.getNumUnmountCalls()).toBe(1);
						expect(myApp.getNumUnloadCalls()).toBe(1);
					})
					.catch(err => {
						fail(err);
						done();
					})

					/* Triggering an app change after calling unloadApplication will
					 * not cause the app to unload, since it is still mounted and we set
					 * waitForUnmount: true.
					 */
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(0);
					expect(myApp.getNumUnloadCalls()).toBe(0);

					window.location.hash = `#`;
					return singleSpa.triggerAppChange();
				})
				.then(() => {
					expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('NOT_LOADED');
					expect(myApp.getNumBootstrapCalls()).toBe(1);
					expect(myApp.getNumMountCalls()).toBe(1);
					expect(myApp.getNumUnmountCalls()).toBe(1);
					expect(myApp.getNumUnloadCalls()).toBe(1);
					done();
				})
				.catch(err => {
					fail(err);
					done();
				});
			});
		});

		it(`resolves the promise for all callers to unloadApplication when the app is unloaded`, done => {
			window.location.hash = activeHash;

			let firstCallerResolved = false, secondCallerResolved = false;

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(singleSpa.getAppStatus('./happy-unload.app.js')).toEqual('MOUNTED');
				expect(myApp.getNumBootstrapCalls()).toBe(1);
				expect(myApp.getNumMountCalls()).toBe(1);
				expect(myApp.getNumUnmountCalls()).toBe(0);
				expect(myApp.getNumUnloadCalls()).toBe(0);
			})
			.then(() => {
				// First caller to unloadApplication wants to waitForUnmount
				singleSpa
				.unloadApplication('./happy-unload.app.js', {waitForUnmount: true})
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

				// Second caller to unloadApplication doesn't want to waitForUnmount
				singleSpa
				.unloadApplication('./happy-unload.app.js', {waitForUnmount: false})
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
