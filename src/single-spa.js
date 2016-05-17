import { handleChildAppError } from './single-spa-child-app-error.js';
import { ensureJQuerySupport } from './jquery-support.js';

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

// App statuses
const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED',
	LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE',
	BOOTSTRAPPING = 'BOOTSTRAPPING',
	NOT_MOUNTED = 'NOT_MOUNTED',
	MOUNTING = 'MOUNTING',
	MOUNTED = 'MOUNTED',
	UNMOUNTING = 'UNMOUNTING',
	SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN';

// Constants that don't change no matter what
export const routingEventsListeningTo = ['hashchange', 'popstate'];

// Things that need to be reset with the init function;
let Loader, childApps, bootstrapMaxTime, mountMaxTime, unmountMaxTime, peopleWaitingOnAppChange, appChangeUnderway, capturedEventListeners;

export function reset() {
	// console.log(`---------------------------`, 'resetting', `---------------------------`)
	childApps = [];

	peopleWaitingOnAppChange = [];
	appChangeUnderway = false;

	Loader = typeof SystemJS !== 'undefined' ? SystemJS : null;

	bootstrapMaxTime = 4000;
	mountMaxTime = 2000;
	unmountMaxTime = 2000;

	window.addEventListener('hashchange', urlReroute);
	window.addEventListener('popstate', urlReroute);

	capturedEventListeners = {
		hashchange: [],
		popstate: [],
	};

	window.addEventListener = function(eventName, fn) {
		if (typeof fn === 'function') {
			if (routingEventsListeningTo.indexOf(eventName) >= 0 && !capturedEventListeners[eventName].find(listener => listener === fn)) {
				capturedEventListeners[eventName].push(fn);
				return;
			}
		}

		return originalAddEventListener.apply(this, arguments);
	}

	window.removeEventListener = function(eventName, listenerFn) {
		if (typeof listenerFn === 'function') {
			if (routingEventsListeningTo.indexOf(eventName) >= 0) {
				capturedEventListeners[eventName] = capturedEventListeners[eventName].filter(fn => fn.toString() !== listenerFn.toString());
				return;
			}
		}

		return originalRemoveEventListener.apply(this, arguments);
	}

	const originalPushState = window.history.pushState;
	window.history.pushState = function(state) {
		const result = originalPushState.apply(this, arguments);

		performAppChanges();
		
		return result;
	}

	window.history.replaceState = function() {
		const result = originalReplaceState.apply(this, arguments);
		performAppChanges();
		return result;
	}
}
// initialize for the first time
reset();

export function setLoader(loader) {
	if (!loader || typeof loader.import !== 'function') {
		throw new Error(`'loader' is not a real loader. Must have an import function that returns a Promise`);
	}
	Loader = loader;
}

export function getMountedApps() {
	return childApps.filter(isActive).map(toLocation);
}

export function getAppStatus(appName) {
	const app = childApps.find(app => app.appLocation === appName);
	return app ? app.status : null;
}

export function setBootstrapMaxTime(time) {
	if (typeof time !== 'number' || time <= 0) {
		throw new Error(`bootstrap max time must be a positive integer number of milliseconds`);
	}

	bootstrapMaxTime = time;
}

export function setMountMaxTime(time) {
	if (typeof time !== 'number' || time <= 0) {
		throw new Error(`mount max time must be a positive integer number of milliseconds`);
	}

	mountMaxTime = time;
}

export function setUnmountMaxTime(time) {
	if (typeof time !== 'number' || time <= 0) {
		throw new Error(`unmount max time must be a positive integer number of milliseconds`);
	}

	unmountMaxTime = time;
}

export function declareChildApplication(appLocation, activeWhen) {
    if (typeof appLocation !== 'string' || appLocation.length === 0)
        throw new Error(`The first argument must be a non-empty string 'appLocation'`);
    if (typeof activeWhen !== 'function')
        throw new Error(`The second argument must be a function 'activeWhen'`);
    if (childApps[appLocation])
        throw new Error(`There is already an app declared at location ${appLocation}`);

    childApps.push({
        appLocation: appLocation,
        activeWhen: activeWhen,
		status: NOT_BOOTSTRAPPED,
    });

	ensureJQuerySupport();

	triggerAppChange();
}

export function triggerAppChange() {
	return performAppChanges();
}

export function navigateToUrl(obj) {
	let url;
	if (typeof obj === 'string') {
		url = obj ;
	} else if (this && this.href) {
		url = this.href;
	} else if (obj && obj.currentTarget && obj.currentTarget.href && obj.preventDefault) {
		url = obj.currentTarget.href;
		obj.preventDefault();
	} else {
		throw new Error(`singleSpaNavigate must be either called with a string url, with an <a> tag as its context, or with an event whose currentTarget is an <a> tag`);
	}

	const anchorElement= document.createElement('a');
	anchorElement.setAttribute('href', url);

	if (window.location.origin + window.location.pathname === anchorElement.origin + anchorElement.pathname) {
		window.location.hash = anchorElement.hash;
	} else {
		window.history.pushState(null, null, url);
	}
}

window.singleSpaNavigate = navigateToUrl;

function urlReroute() {
	performAppChanges([], arguments)
}

function performAppChanges(pendingPromises = [], eventArguments) {
	// console.log('\n\n\n')
	if (appChangeUnderway) {
		// console.log('people waiting')
		return new Promise((resolve, reject) => {
			peopleWaitingOnAppChange.push({
				resolve,
				reject,
			});
		});
	}

	appChangeUnderway = true;

	return new Promise((_resolve, _reject) => {

		let wasNoOp = true;

		const unmountPromises = childApps
			.filter(shouldntBeActive)
			.filter(notSkipped)
			.filter(isActive)
			.map(toUnmountPromise)
		// console.log('unmount promises = ', unmountPromises);
		
		if (unmountPromises.length > 0) {
			wasNoOp = false;
		}

		Promise
		.all(unmountPromises)
		.then(() => {
			callCapturedEventListeners();
			// console.log('done unmounting apps')

			const bootstrapPromises = childApps
				.filter(shouldBeActive)
				.filter(notSkipped)
				.filter(isntActive)
				.map(toBootstrapPromise)

			if (bootstrapPromises.length > 0) {
				wasNoOp = false;
			}

			// console.log('bootstrap promises = ', bootstrapPromises)

			Promise
			.all(bootstrapPromises)
			.then(appsToMount => {
				appsToMount = appsToMount
					.filter(notSkipped)
					.map(toMountPromise)

				if (appsToMount.length > 0) {
					wasNoOp = false;
				}

				// console.log('appsToMount = ', appsToMount)

				Promise
				.all(appsToMount)
				.then(() => {
					// console.log('mounted all the apps')
					resolve(getMountedApps());
				})
				.catch(reject);
			})
			.catch(reject);
		})
		.catch(ex => {
			callCapturedEventListeners();
			reject(ex);
		});

		function callCapturedEventListeners() {
			if (eventArguments) {
				const eventType = eventArguments[0].type;
				if (routingEventsListeningTo.indexOf(eventType) >= 0) {
					capturedEventListeners[eventType].forEach(listener => {
						listener.apply(this, eventArguments);
					});
				}
			}
		}

		function resolve() {
			_resolve.apply(this, arguments);
			appChangeUnderway = false;
			pendingPromises.forEach(promise => promise.resolve.apply(this, arguments));

			if (peopleWaitingOnAppChange.length > 0) {
				const nextPendingPromises = peopleWaitingOnAppChange;
				peopleWaitingOnAppChange = [];
				performAppChanges(nextPendingPromises);
			} else {
				if (!wasNoOp) {
					window.dispatchEvent(new CustomEvent("single-spa:app-change"));
				}

				window.dispatchEvent(new CustomEvent("single-spa:routing-event"));
			}
		}

		function reject() {
			_reject.apply(this, arguments);
			pendingPromises.forEach(promise => promise.reject.apply(this, arguments));
		}
	});
}

function toBootstrapPromise(app) {
	if (app.status !== NOT_BOOTSTRAPPED) {
		return Promise.resolve(app);
	}

	return new Promise((resolve, reject) => {
		// console.log(`bootstrapping app ${app.appLocation}`)
		app.status = LOADING_SOURCE_CODE;

		Loader
		.import(app.appLocation)
		.then(appOpts => {
			// console.log(`app opts for ${app.appLocation}`);

			let validationErrMessage;

			if (typeof appOpts !== 'object') {
				validationErrMessage = `App '${app.appLocation}' does not export an object`;
			}

			if (!validLifecycleFn(appOpts.bootstrap)) {
				validationErrMessage = `App '${app.appLocation}' does not export a bootstrap function or array of functions`;
			}

			if (!validLifecycleFn(appOpts.mount)) {
				validationErrMessage = `App '${app.appLocation}' does not export a mount function or array of functions`;
			}

			if (!validLifecycleFn(appOpts.unmount)) {
				validationErrMessage = `App '${app.appLocation}' does not export an unmount function or array of functions`;
			}

			if (validationErrMessage) {
				handleChildAppError(validationErrMessage);
				app.status = SKIP_BECAUSE_BROKEN;
				resolve(app);
				return;
			}

			app.bootstrap = flattenFnArray(appOpts.bootstrap, `App '${app.appLocation}' bootstrap function`);
			app.mount = flattenFnArray(appOpts.mount, `App '${app.appLocation}' mount function`);
			app.unmount = flattenFnArray(appOpts.unmount, `App '${app.appLocation}' unmount function`);
			app.timeouts = ensureValidAppTimeouts(appOpts.timeouts);

			// console.log('has valid opts')

			app.status = BOOTSTRAPPING;
			reasonableTime(app.bootstrap(), `Bootstrapping app '${app.appLocation}'`, app.timeouts.bootstrap)
			.then(() => {
				// console.log(`app ${app.appLocation} bootstrapped`)
				app.status = NOT_MOUNTED;
				resolve(app);
			})
			.catch((ex) => {
				handleChildAppError(ex);
				app.status = SKIP_BECAUSE_BROKEN;
				resolve(app);
			});

			function validLifecycleFn(fn) {
				return fn && (typeof fn === 'function' || isArrayOfFns(fn));

				function isArrayOfFns(arr) {
					return Array.isArray(arr) && !arr.find(item => typeof item !== 'function');
				}
			}

			function flattenFnArray(fns, description) {
				fns = Array.isArray(fns) ? fns : [fns];

				return function() {
					return new Promise((resolve, reject) => {
						waitForPromises(0);

						function waitForPromises(index) {
							const promise = fns[index]();
							if (!(promise instanceof Promise)) {
								// console.log(`${description} isn't promise`)
								reject(`${description} at index ${index} did not return a promise`);
							} else {
								// console.log(`${description} is promise`)
								promise
								.then(() => {
									// console.log(`${description} done`)
									if (index === fns.length - 1) {
										resolve();
									} else {
										waitForPromises(index + 1);
									}
								})
								.catch(reject);
							}
						}
					});
				}
			}

			function ensureValidAppTimeouts(timeouts = {}) {
				// console.log('timeouts')
				// console.dir(timeouts)
				return {
					bootstrap: {
						millis: bootstrapMaxTime,
						dieOnTimeout: false,
					},
					mount: {
						millis: mountMaxTime,
						dieOnTimeout: false,
					},
					unmount: {
						millis: unmountMaxTime,
						dieOnTimeout: false,
					},
					...timeouts,
				};
			}
		})
		.catch(ex => {
			handleChildAppError(ex);
			app.status = SKIP_BECAUSE_BROKEN;
			resolve(app);
		});
	});
}

function toMountPromise(app) {
	// console.log('to mount promise')
	return new Promise((resolve, reject) => {
		reasonableTime(app.mount(), `Mounting application ${app.appLocation}'`, app.timeouts.mount)
		.then(() => {
			app.status = MOUNTED;
			resolve(app);
		})
		.catch(ex => {
			handleChildAppError(ex);
			app.status = SKIP_BECAUSE_BROKEN;
			resolve(app);
		});
	});
}

function toUnmountPromise(app) {
	return new Promise((resolve, reject) => {
		app.status = UNMOUNTING

		reasonableTime(app.unmount(), `Unmounting application ${app.appLocation}'`, app.timeouts.unmount)
		.then(() => {
			app.status = NOT_MOUNTED;
			resolve(app);
		})
		.catch(ex => {
			handleChildAppError(ex);
			app.status = SKIP_BECAUSE_BROKEN;
			resolve(app);
		});
	});
}

function reasonableTime(promise, description, timeoutConfig, app) {
	// console.log(`${description}, dieOnTimeout = ${timeoutConfig.dieOnTimeout}`);
	const maxWarnings = 3;
	const warningPeriod = 1000;

	return new Promise((resolve, reject) => {
		let finished = false;

		promise
		.then(val => {
			// console.log('resolving reasonable time')
			finished = true;
			resolve(val);
		})
		.catch(val => {
			// console.log('rejecting reasonable time')
			finished = true;
			reject(val);
		});

		setTimeout(() => maybeTimingOut(1), Math.max(0, timeoutConfig.millis - (maxWarnings * warningPeriod)));

		function maybeTimingOut(numWarnings) {
			if (!finished) {
				if (numWarnings >= numWarnings) {
					if (timeoutConfig.dieOnTimeout) {
						reject(`${description} did not resolve or reject for ${timeoutConfig.millis} milliseconds`);
					} else {
						console.error(`${description} did not resolve or reject for ${timeoutConfig.millis} milliseconds -- we're no longer going to warn you about it.`);
						//don't resolve or reject, we're waiting this one out
					}
				} else {
					console.warn(`${description} did not resolve or reject within ${timeoutConfig.millis} milliseconds`);
					setTimeout(() => maybeTimingOut(numWarnings + 1), warningPeriod);
				}
			}
		}
	});
}

function shouldBeActive(app) {
	try {
		return app.activeWhen(window.location);
	} catch (ex) {
		handleChildAppError(ex);
		app.status = SKIP_BECAUSE_BROKEN;
	}
}

function shouldntBeActive(app) {
	try {
		return !app.activeWhen(window.location);
	} catch (ex) {
		handleChildAppError(ex);
		app.status = SKIP_BECAUSE_BROKEN;
	}
}

function isActive(app) {
	return app.status === MOUNTED;
}

function isntActive(app) {
	return !isActive(app);
}

function notBootstrapped(app) {
	return app.status !== NOT_BOOTSTRAPPED;
}

function notSkipped(item) {
	return item !== SKIP_BECAUSE_BROKEN && (!item || item.status !== SKIP_BECAUSE_BROKEN);
}

function toLocation(app) {
	return app.appLocation;
}
