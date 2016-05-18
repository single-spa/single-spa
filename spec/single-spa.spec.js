import * as singleSpa from '../src/single-spa.js';
import * as SingleSpaChildAppError from '../src/single-spa-child-app-error.js';

let Loader;

function easyDeclareChild(name) {
	const pathToApp = getPathToApp(name);

	singleSpa.declareChildApplication(pathToApp, require(`./apps/${name}/${name}.active-when.js`).activeWhen);

	return require(pathToApp);
}

function getPathToApp(name) {
	return `../spec/apps/${name}/${name}.app.js`;
}

describe(`single-spa`, () => {
	const originalGetMountedApps = singleSpa.getMountedApps;
	const originalGetAppStatus = singleSpa.getAppStatus;

	process.on('unhandledRejection', (reason, p) => {
		console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
		process.exit(1);
	});

	beforeEach(() => {
		Loader = {
			import: function(filename) {
				return new Promise((resolve, reject) => {
					try {
						resolve(require(filename));
					} catch (ex) {
						reject(ex);
					}
				});
			},
		};

		singleSpa.reset();
		singleSpa.setLoader(Loader);

		singleSpa.getMountedApps = function() {
			return originalGetMountedApps()
			.map(appName => appName.substring(appName.lastIndexOf('/') + 1, appName.length - '.app.js'.length));
		};

		singleSpa.getAppStatus = function(name) {
			return originalGetAppStatus(getPathToApp(name));
		};
	});

	afterEach(() => {
		singleSpa.getMountedApps = originalGetMountedApps;
		singleSpa.getAppStatus = originalGetAppStatus;
	});

	describe('happy-basic app', () => {
		it(`goes through the whole lifecycle successfully`, (done) => {
			const childModule = easyDeclareChild('happy-basic')
			console.dir(childModule)
			expect(childModule.wasBootstrapped).toEqual(false);
			expect(childModule.isMounted).toEqual(false);
			expect(singleSpa.getMountedApps()).toEqual([]);

			window.location = 'happy-basic';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childModule.wasBootstrapped).toEqual(true);
				expect(childModule.isMounted).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual(['happy-basic']);

				window.location = 'not-happy-basic';

				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(childModule.wasBootstrapped).toEqual(true);
					expect(childModule.isMounted).toEqual(false);
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

	describe(`invalid-no-bootstrap`, () => {
		it(`is never mounted`, (done) => {
			const childModule = easyDeclareChild('invalid-no-bootstrap');

			window.location = 'invalid-no-bootstrap';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childModule.isMounted).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('invalid-no-bootstrap')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});

	describe(`invalid-no-mount`, () => {
		it(`is never bootstrapped`, (done) => {
			const childModule = easyDeclareChild('invalid-no-mount');

			window.location = 'invalid-no-mount';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childModule.isBootstrapped).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('invalid-no-mount')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});

	describe(`invalid-no-unmount`, () => {
		it(`is never bootstrapped`, (done) => {
			const childModule = easyDeclareChild('invalid-no-unmount');

			window.location = 'invalid-no-unmount';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childModule.isBootstrapped).toEqual(false);
				expect(childModule.isMounted).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('invalid-no-unmount')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});

	describe(`invalid-bootstrap`, () => {
		it(`is never bootstrapped, mounted, or unmounted`, (done) => {
			const childModule = easyDeclareChild('invalid-bootstrap');

			window.location = 'invalid-bootstrap';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childModule.mountCalled).toEqual(false);
				expect(childModule.unmountCalled).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('invalid-bootstrap')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});

	describe(`invalid-mount`, () => {
		it(`is bootstrapped and mounted, but then put in a broken state and never unmounted`, (done) => {
			const childModule = easyDeclareChild('invalid-mount');

			window.location = 'invalid-mount';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childModule.wasBootstrapped).toEqual(true);
				expect(childModule.wasMounted).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('invalid-mount')).toEqual('SKIP_BECAUSE_BROKEN');

				window.location = 'not-invalid-mount';
				singleSpa
				.triggerAppChange()
				.then(() => {
					// doesn't get unmounted because it's in a broken state.
					expect(childModule.wasUnmounted).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus('invalid-mount')).toEqual('SKIP_BECAUSE_BROKEN');
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

	describe(`invalid-unmount`, () => {
		it(`is bootstrapped, mounted, and unmounted, but then put in a broken state and never again mounted`, (done) => {
			const childModule = easyDeclareChild('invalid-unmount');

			window.location = 'invalid-unmount';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(childModule.bootstrapCalled).toEqual(1);
				expect(childModule.mountCalled).toEqual(1);
				expect(singleSpa.getMountedApps()).toEqual(['invalid-unmount']);
				expect(singleSpa.getAppStatus('invalid-unmount')).toEqual('MOUNTED');

				// now unmount, which will be the first time it enters a broken state
				window.location = 'not-invalid-unmount';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(childModule.bootstrapCalled).toEqual(1);
					expect(childModule.mountCalled).toEqual(1);
					expect(childModule.unmountCalled).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus('invalid-unmount')).toEqual('SKIP_BECAUSE_BROKEN');

					// now remount and check if it tries to mount despite being in a broken state
					window.location = 'invalid-unmount';
					singleSpa
					.triggerAppChange()
					.then(() => {
						expect(childModule.bootstrapCalled).toEqual(1);
						expect(childModule.mountCalled).toEqual(1); // hasn't increased
						expect(childModule.unmountCalled).toEqual(1);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus('invalid-unmount')).toEqual('SKIP_BECAUSE_BROKEN');
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
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});

	describe(`bootstrap-times-out`, () => {
		it(`is just waited for if dieOnTimeout is false`, (done) => {
			const module = easyDeclareChild('bootstrap-times-out');

			// when dieOnTimeout is false, single-spa just waits forever for it
			module.timeouts.bootstrap.dieOnTimeout = false;
			module.bootstrapCalled = false;
			module.mountCalled = false;

			window.location = 'bootstrap-times-out';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.bootstrapCalled).toEqual(true);
				expect(module.mountCalled).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual(['bootstrap-times-out']);
				expect(singleSpa.getAppStatus('bootstrap-times-out')).toEqual('MOUNTED');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});

		it(`is put into SKIP_BECAUSE_BROKEN if dieOnTimeout is true`, (done) => {
			const module = easyDeclareChild('bootstrap-times-out');

			// when dieOnTimeout is false, single-spa just waits forever for it
			module.timeouts.bootstrap.dieOnTimeout = true;
			module.bootstrapCalled = false;
			module.mountCalled = false;
			window.location = 'bootstrap-times-out';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.bootstrapCalled).toEqual(true);
				expect(module.mountCalled).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('bootstrap-times-out')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});

	describe(`mount-times-out`, () => {
		it(`is just waited for if dieOnTimeout is false`, (done) => {
			const module = easyDeclareChild('mount-times-out');

			// when dieOnTimeout is false, single-spa just waits forever for it
			module.reset();
			module.timeouts.mount.dieOnTimeout = false;

			window.location = 'mount-times-out';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.numBootstraps).toEqual(1);
				expect(module.numMounts).toEqual(1);
				expect(singleSpa.getMountedApps()).toEqual(['mount-times-out']);
				expect(singleSpa.getAppStatus('mount-times-out')).toEqual('MOUNTED');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});

		it(`is put into SKIP_BECAUSE_BROKEN if dieOnTimeout is true`, (done) => {
			const module = easyDeclareChild('mount-times-out');

			// when dieOnTimeout is false, single-spa just waits forever for it
			module.reset();
			module.timeouts.mount.dieOnTimeout = true;
			window.location = 'mount-times-out';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.numBootstraps).toEqual(1);
				expect(module.numMounts).toEqual(1);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('mount-times-out')).toEqual('SKIP_BECAUSE_BROKEN');
				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});

	describe(`unmount-times-out`, () => {
		it(`is just waited for if dieOnTimeout is false`, (done) => {
			const module = easyDeclareChild('unmount-times-out');

			// when dieOnTimeout is false, single-spa just waits forever for it
			module.reset();
			module.timeouts.unmount.dieOnTimeout = false;

			window.location = 'unmount-times-out';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.numBootstraps).toEqual(1);
				expect(module.numMounts).toEqual(1);
				expect(singleSpa.getMountedApps()).toEqual(['unmount-times-out']);
				expect(singleSpa.getAppStatus('unmount-times-out')).toEqual('MOUNTED');

				window.location = 'not-unmount-times-out';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(module.numUnmounts).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus('unmount-times-out')).toEqual('NOT_MOUNTED');
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

		it(`is put into SKIP_BECAUSE_BROKEN when dieOnTimeout is true`, (done) => {
			const module = easyDeclareChild('unmount-times-out');

			// when dieOnTimeout is false, single-spa just waits forever for it
			module.reset();
			module.timeouts.unmount.dieOnTimeout = true;

			window.location = 'unmount-times-out';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.numBootstraps).toEqual(1);
				expect(module.numMounts).toEqual(1);
				expect(singleSpa.getMountedApps()).toEqual(['unmount-times-out']);
				expect(singleSpa.getAppStatus('unmount-times-out')).toEqual('MOUNTED');

				window.location = 'not-unmount-times-out';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(module.numUnmounts).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus('unmount-times-out')).toEqual('SKIP_BECAUSE_BROKEN');
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

	describe(`multiple bootstraps, mounts, and unmounts`, () => {
		it(`waits for each of the functions one by one, in order`, (done) => {
			const module = easyDeclareChild('multiple-lifecycle-functions');

			window.location = 'multiple-lifecycle-functions';
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.bootstrapsCalledOutOfOrder).toEqual(undefined);
				expect(module.bootstrap1Called).toEqual(true);
				expect(module.bootstrap2Called).toEqual(true);
				expect(module.bootstrap3Called).toEqual(true);

				expect(module.mountsCalledOutOfOrder).toEqual(undefined);
				expect(module.mount1Called).toEqual(true);
				expect(module.mount2Called).toEqual(true);
				expect(module.mount3Called).toEqual(true);

				window.location = 'not-multiple-lifecycle-functions';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(module.unmountsCalledOutOfOrder).toEqual(undefined);

					expect(module.unmount1Called).toEqual(true);
					expect(module.unmount2Called).toEqual(true);
					expect(module.unmount3Called).toEqual(true);

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

	describe(`bootstrap-rejects`, () => {
		it(`puts the modules into SKIP_BECAUSE_BROKEN and doesn't mount it`, (done) => {
			const module = easyDeclareChild('bootstrap-rejects');

			window.location = 'bootstrap-rejects';

			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.wasBootstrapped).toEqual(true);
				expect(module.wasMounted).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('bootstrap-rejects')).toEqual('SKIP_BECAUSE_BROKEN');

				done();
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});

	describe(`mount-rejects`, () => {
		it(`bootstraps and mounts, but then is put into SKIP_BECAUSE_BROKEN and never unmounts`, () => {
			const module = easyDeclareChild('mount-rejects');

			window.location = 'mount-rejects';
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.wasBootstrapped).toEqual(true);
				expect(module.wasMounted).toEqual(true);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('mount-rejects')).toEqual('SKIP_BECAUSE_BROKEN');

				window.location = 'not-mount-rejects';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(module.wasUnmounted).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus('mount-rejects')).toEqual('SKIP_BECAUSE_BROKEN');

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

	describe(`unmount-rejects`, () => {
		it(`bootstraps and mounts, but then is put into SKIP_BECAUSE_BROKEN once it unmounts`, () => {
			const module = easyDeclareChild('unmount-rejects');

			window.location = 'unmount-rejects';
			singleSpa
			.triggerAppChange()
			.then(() => {
				expect(module.numBootstraps).toEqual(1);
				expect(module.numMounts).toEqual(1);
				expect(module.numUnmounts).toEqual(0);
				expect(singleSpa.getMountedApps()).toEqual([]);
				expect(singleSpa.getAppStatus('unmount-rejects')).toEqual('SKIP_BECAUSE_BROKEN');

				window.location = 'not-unmount-rejects';
				singleSpa
				.triggerAppChange()
				.then(() => {
					expect(module.numUnmounts).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus('unmount-rejects')).toEqual('SKIP_BECAUSE_BROKEN');

					window.location = 'unmount-rejects';
					singleSpa
					.triggerAppChange()
					.then(() => {
						// it shouldn't be mounted again
						expect(module.numMounts).toEqual(1);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus('unmount-rejects')).toEqual('SKIP_BECAUSE_BROKEN');

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
			})
			.catch(ex => {
				fail(ex);
				done();
			});
		});
	});
});
