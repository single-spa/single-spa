export default function singleSpaEventsApi() {
	describe(`single-spa:routing-event`, () => {
		const dummyApp = {
			bootstrap() {return Promise.resolve()},
			mount() {return Promise.resolve()},
			unmount() {return Promise.resolve()},
			unload() {return Promise.resolve()},
		};

		beforeAll(() => {
			singleSpa.declareChildApplication('russell', () => Promise.resolve(dummyApp), () => window.location.hash.startsWith("#russell"));
		});

		beforeEach(() => {
			window.location.hash = ``;
		});

		it(`is fired on the window whenever the hash changes`, done => {
			singleSpa
			.triggerAppChange() // start with a clean slate (no previous tests doing anything)
			.then(() => {
				window.addEventListener("single-spa:routing-event", finishTest);
				window.location.hash = `#/hash-was-changed`;

				function finishTest() {
					window.removeEventListener("single-spa:routing-event", finishTest);
					done();
				}
			})
			.catch(err => {
				fail(err);
				done();
			});
		});

		it(`is fired on the window whenever the url changes`, done => {
			singleSpa
			.triggerAppChange() // start with a clean slate (no previous tests doing anything)
			.then(() => {
				window.addEventListener("single-spa:routing-event", finishTest);
				window.location.hash = `#/push-state-called`;

				function finishTest() {
					window.removeEventListener("single-spa:routing-event", finishTest);
					done();
				}
			})
			.catch(err => {
				fail(err);
				done();
			});
		});
	});

	describe(`single-spa:app-change`, () => {
		it(`is fired when an app is unmounted`, done => {
			singleSpa
			.triggerAppChange() // start with a clean slate (no previous tests doing anything)
			.then(() => {
				window.addEventListener("single-spa:app-change", finishTest);
				window.location.hash = `#russell`;

				function finishTest() {
					window.removeEventListener("single-spa:app-change", finishTest);
					done();
				}
			})
			.catch(err => {
				fail(err);
				done();
			});
		});

		it(`is not fired when no app is mounted`, done => {
			function failTest() {
				fail(`single-spa:app-change should not be called when no apps change`);
				window.removeEventListener("single-spa:app-change", failTest);
				done();
			}

			singleSpa
			.triggerAppChange() 
			.then(() => {
				window.addEventListener("single-spa:app-change", failTest);
				window.location.hash = `#/not-a-real-app`;

				return singleSpa.triggerAppChange();
			})
			.then(() => {
				window.removeEventListener("single-spa:app-change", failTest);

				// If failTest wasn't called, then we're good
				done();
			})
			.catch(err => {
				fail(err);
				done();
			});
		})
	});

	describe(`single-spa:no-app-change`, () => {
		it(`is fired when no app is loaded, bootstrapped, mounted, unmounted, or unloaded`, done => {
			singleSpa
			.triggerAppChange() // start with a clean slate (no previous tests doing anything)
			.then(() => {
				window.addEventListener("single-spa:app-change", finishTest);
				window.location.hash = `#not-a-real-app`;

				function finishTest() {
					window.removeEventListener("single-spa:app-change", finishTest);
					done();
				}
			})
			.catch(err => {
				fail(err);
				done();
			});
		});

		it(`is not fired when an app is mounted`, done => {
			function failTest() {
				fail(`single-spa:app-change should not be called when no apps change`);
				window.removeEventListener("single-spa:app-change", failTest);
				done();
			}

			singleSpa
			.triggerAppChange() 
			.then(() => {
				window.addEventListener("single-spa:app-change", failTest);
				window.location.hash = `#/russell`;

				return singleSpa.triggerAppChange();
			})
			.then(() => {
				window.removeEventListener("single-spa:app-change", failTest);

				// If failTest wasn't called, then we're good
				done();
			})
			.catch(err => {
				fail(err);
				done();
			});
		})
	});
}
