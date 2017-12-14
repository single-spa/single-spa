export default function() {
	describe(`invalid-load-function`, () => {
		beforeEach(() => {
			location.hash = "#";
		});

		afterEach(() => {
			location.hash = "#";
		});

		it('Dies if the load function returns nothing', done => {
			function loadFunction() {
				// return nothing
			}
			singleSpa.registerApplication('./invalid-load-function.app.js', loadFunction, location => location.hash === "#invalid-load-function");

			let applicationBrokenCalled = false;
			window.addEventListener("single-spa:application-broken", applicationBroken);

			function applicationBroken(evt) {
				applicationBrokenCalled = true;
				expect(evt.detail.appName).toBe('./invalid-load-function.app.js');
				expect(evt.detail.err.message.indexOf('single-spa loading function did not return a promise. Check the second argument to registerApplication')).toBeGreaterThan(-1);
			}

			location.hash = "#invalid-load-function";

			singleSpa
			.triggerAppChange()
			.then(() => {
				window.removeEventListener("single-spa:application-broken", applicationBroken);
				expect(applicationBrokenCalled).toBe(true);
				expect(singleSpa.getAppStatus('./invalid-load-function.app.js')).toBe(singleSpa.SKIP_BECAUSE_BROKEN);
				done();
			})
			.catch(err => {
				window.removeEventListener("single-spa:application-broken", applicationBroken);
				fail(err);
				done();
			})
		});

		it('Dies if the load function returns a function instead of a promise', done => {
			function loadFunction() {
				return function() {
					return Promise.resolve();
				}
			}
			singleSpa.registerApplication('./invalid-load-function.app.js', loadFunction, location => location.hash === "#invalid-load-function");

			let applicationBrokenCalled = false;
			window.addEventListener("single-spa:application-broken", applicationBroken);

			function applicationBroken(evt) {
				applicationBrokenCalled = true;
				expect(evt.detail.appName).toBe('./invalid-load-function.app.js');
				expect(evt.detail.err.message.indexOf('single-spa loading function did not return a promise. Check the second argument to registerApplication')).toBeGreaterThan(-1);
			}

			location.hash = "#invalid-load-function";

			singleSpa
			.triggerAppChange()
			.then(() => {
				window.removeEventListener("single-spa:application-broken", applicationBroken);
				expect(applicationBrokenCalled).toBe(true);
				expect(singleSpa.getAppStatus('./invalid-load-function.app.js')).toBe(singleSpa.SKIP_BECAUSE_BROKEN);
				done();
			})
			.catch(err => {
				window.removeEventListener("single-spa:application-broken", applicationBroken);
				fail(err);
				done();
			})
		});

		it('Dies if the load function returns a non-thenable object', done => {
			function loadFunction() {
				return {
					things: `that aren't valid`,
					catch: 'khalifa',
				};
			}
			singleSpa.registerApplication('./invalid-load-function.app.js', loadFunction, location => location.hash === "#invalid-load-function");

			let applicationBrokenCalled = false;
			window.addEventListener("single-spa:application-broken", applicationBroken);

			function applicationBroken(evt) {
				applicationBrokenCalled = true;
				expect(evt.detail.appName).toBe('./invalid-load-function.app.js');
				expect(evt.detail.err.message.indexOf('single-spa loading function did not return a promise. Check the second argument to registerApplication')).toBeGreaterThan(-1);
			}

			location.hash = "#invalid-load-function";

			singleSpa
			.triggerAppChange()
			.then(() => {
				window.removeEventListener("single-spa:application-broken", applicationBroken);
				expect(applicationBrokenCalled).toBe(true);
				expect(singleSpa.getAppStatus('./invalid-load-function.app.js')).toBe(singleSpa.SKIP_BECAUSE_BROKEN);
				done();
			})
			.catch(err => {
				window.removeEventListener("single-spa:application-broken", applicationBroken);
				fail(err);
				done();
			})
		});
	});
}
