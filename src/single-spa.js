let appLocationToApp = {};
let unhandledRouteHandlers = [];
let mountedApp;
const nativeAddEventListener = window.addEventListener;
const urlLoader = new LoaderPolyfill();
const nativeSystemGlobal = window.System;
const requiredLifeCycleFuncs = [
	'entryWillBeInstalled',
	'entryWasInstalled',
	'applicationWillMount',
	'mountApplication',
	'applicationWasMounted',
	'applicationWillUnmount',
	'unmountApplication',
	'activeApplicationSourceWillUpdate',
	'activeApplicationSourceWillUpdate'
];

window.singlespa = function(element) {
	window.history.pushState(undefined, '', element.getAttribute('href'));
	setTimeout(function() {
		triggerAppChange();
	}, 10);
	return false;
}

export function declareChildApplication(appLocation, activeWhen) {
	if (typeof appLocation !== 'string' || appLocation.length === 0)
		throw new Error(`The first argument must be a non-empty string 'appLocation'`);
	if (typeof activeWhen !== 'function')
		throw new Error(`The second argument must be a function 'activeWhen'`);
	if (appLocationToApp[appLocation])
		throw new Error(`There is already an app declared at location ${appLocation}`);

	appLocationToApp[appLocation] = {
		appLocation: appLocation,
		activeWhen: activeWhen,
		parentApp: mountedApp ? mountedApp.appLocation : null
	};

	triggerAppChange();
}

export function addUnhandledRouteHandler(handler) {
	if (typeof handler !== 'function') {
		throw new Error(`The first argument must be a handler function`);
	}
	unhandledRouteHandlers.push(handler);
}

export function updateApplicationSourceCode(appName) {
	if (!appLocationToApp[appName]) {
		throw new Error(`No such app '${appName}'`);
	}
	let app = appLocationToApp[appName];
	app.lifecycleFunctions.activeApplicationSourceWillUpdate()
	.then((resolve) => {
		//TODO reload the app
		resolve()
	})
	.then(app.lifecycleFunctions.activeApplicationSourceWasUpdated);
}

function callLifecycleFunction(app, funcName, ...args) {
	return new Promise((resolve) => {
		callFunc(0);
		function callFunc(i) {
			app.lifecycles[i][funcName](...args)
			.then(() => {
				if (i === app.lifecycles.length - 1) {
					resolve();
				} else {
					callFunc(++i);
				}
			})
		}
	})
}

function triggerAppChange() {
	let newApp = appForCurrentURL();
	if (!newApp) {
		unhandledRouteHandlers.forEach((handler) => {
			handler(mountedApp);
		});
	}

	if (newApp !== mountedApp) {
		let appWillUnmountPromise = mountedApp ? callLifecycleFunction(mountedApp, 'applicationWillUnmount') : new Promise((resolve) => resolve());

		appWillUnmountPromise
		.then(() => {
			return new Promise(function(resolve) {
				if (mountedApp) {
					callLifecycleFunction(mountedApp, 'unmountApplication', mountedApp.containerEl)
					.then(() => {
						finishUnmountingApp(mountedApp);
						resolve();
					});
				} else {
					resolve();
				}
			});
		})
		.then(() => {
			if (newApp.entryURI) {
				return new Promise((resolve) => resolve());
			} else {
				return loadAppForFirstTime(newApp.appLocation);
			}
		})
		.then(() => callLifecycleFunction(newApp, 'applicationWillMount'))
		.then(() => appWillBeMounted(newApp))
		.then(() => callLifecycleFunction(newApp, 'mountApplication', newApp.containerEl))
		.then(() => mountedApp = newApp)
	}
}

function loadAppForFirstTime(appLocation) {
	return new Promise(function(resolve, reject) {
		var currentAppSystemGlobal = window.System;
		window.System = nativeSystemGlobal;
		nativeSystemGlobal.import(appLocation).then(function(restOfApp) {
			registerApplication(appLocation, restOfApp.entryURI, restOfApp.lifecycles);
			let app = appLocationToApp[appLocation];
			window.System = currentAppSystemGlobal;
			callLifecycleFunction(app, 'entryWillBeInstalled')
			.then(() => window.System.import(app.entryURI))
			.then(() => callLifecycleFunction(app, 'entryWasInstalled'))
			.then(() => resolve())
		})
	})
}

function registerApplication(appLocation, entryURI, lifecycles) {
	//validate
	if (typeof entryURI !== 'string') {
		throw new Error(`App ${appLocation} must export an entryURI string`);
	}
	if (typeof lifecycles !== 'object' && typeof lifecycles !== 'function') {
		throw new Error(`App ${appLocation} must export a 'lifecycles' object or array of objects`);
	}
	if (!Array.isArray(lifecycles)) {
		lifecycles = [lifecycles];
	}
	for (let i=0; i<lifecycles.length; i++) {
		requiredLifeCycleFuncs.forEach((requiredLifeCycleFunc) => {
			if (typeof lifecycles[i][requiredLifeCycleFunc] !== 'function') {
				throw new Error(`In app '${appLocation}', The lifecycle at index ${i} does not have required function ${requiredLifeCycleFunc}`);
			}
		});
	}

	//register
	let app = appLocationToApp[appLocation];
	app.entryURI = entryURI;
	app.hashChangeFunctions = [];
	app.popStateFunctions = [];
	app.lifecycles = lifecycles;
}

nativeAddEventListener('popstate', triggerAppChange);


function appForCurrentURL() {
	let appsForCurrentUrl = [];
	for (let appName in appLocationToApp) {
		let app = appLocationToApp[appName];
		if (app.activeWhen(window.location)) {
			appsForCurrentUrl.push(app);
		}
	}
	switch (appsForCurrentUrl.length) {
		case 0:
			return undefined;
		case 1:
			return appsForCurrentUrl[0];
		default:
			appNames = appsForCurrentUrl.map((app) => app.name);
		throw new Error(`The following applications all claim to own the location ${window.location.href} -- ${appnames.toString()}`)
	}
}

function appWillBeMounted(app) {
	return new Promise((resolve) => {
		app.hashChangeFunctions.forEach((hashChangeFunction) => {
			nativeAddEventListener('hashchange', hashChangeFunction);
		});
		app.popStateFunctions.forEach((popStateFunction) => {
			nativeAddEventListener('popstate', popStateFunction);
		});
		app.containerEl = document.createElement('div');
		app.containerEl.setAttribute('single-spa-active-app', app.appLocation);
		document.body.appendChild(app.containerEl);
		resolve();
	})
}

function finishUnmountingApp(app) {
	app.hashChangeFunctions.forEach((hashChangeFunction) => {
		window.removeEventListener('hashchange', hashChangeFunction);
	});
	app.popStateFunctions.forEach((popStateFunction) => {
		window.removeEventListener('popstate', popStateFunction);
	});
	document.body.removeChild(app.containerEl);
}

window.addEventListener = function(name, fn) {
	if (mountedApp) {
		if (name === 'popstate') {
			mountedApp.popStateFunctions.push(fn);
		} else if (name === 'hashchange') {
			mountedApp.hashChangeFunctions.push(fn);
		}
		nativeAddEventListener.apply(this, arguments);
	}
}
