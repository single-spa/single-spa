'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.declareChildApplication = declareChildApplication;
exports.addUnhandledRouteHandler = addUnhandledRouteHandler;
exports.updateApplicationSourceCode = updateApplicationSourceCode;
var appLocationToApp = {};
var unhandledRouteHandlers = [];
var mountedApp = undefined;
var nativeAddEventListener = window.addEventListener;
var urlLoader = new LoaderPolyfill();
var nativeSystemGlobal = window.System;
var requiredLifeCycleFuncs = ['entryWillBeInstalled', 'entryWasInstalled', 'applicationWillMount', 'mountApplication', 'applicationWasMounted', 'applicationWillUnmount', 'unmountApplication', 'activeApplicationSourceWillUpdate', 'activeApplicationSourceWillUpdate'];

window.singlespa = function (element) {
	window.history.pushState(undefined, '', element.getAttribute('href'));
	setTimeout(function () {
		triggerAppChange();
	}, 10);
	return false;
};

function declareChildApplication(appLocation, activeWhen) {
	if (typeof appLocation !== 'string' || appLocation.length === 0) throw new Error('The first argument must be a non-empty string \'appLocation\'');
	if (typeof activeWhen !== 'function') throw new Error('The second argument must be a function \'activeWhen\'');
	if (appLocationToApp[appLocation]) throw new Error('There is already an app declared at location ' + appLocation);

	appLocationToApp[appLocation] = {
		appLocation: appLocation,
		activeWhen: activeWhen,
		parentApp: mountedApp ? mountedApp.appLocation : null
	};

	triggerAppChange();
}

function addUnhandledRouteHandler(handler) {
	if (typeof handler !== 'function') {
		throw new Error('The first argument must be a handler function');
	}
	unhandledRouteHandlers.push(handler);
}

function updateApplicationSourceCode(appName) {
	if (!appLocationToApp[appName]) {
		throw new Error('No such app \'' + appName + '\'');
	}
	var app = appLocationToApp[appName];
	app.lifecycleFunctions.activeApplicationSourceWillUpdate().then(function (resolve) {
		//TODO reload the app
		resolve();
	}).then(app.lifecycleFunctions.activeApplicationSourceWasUpdated);
}

function callLifecycleFunction(app, funcName) {
	for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
		args[_key - 2] = arguments[_key];
	}

	return new Promise(function (resolve) {
		callFunc(0);
		function callFunc(i) {
			var _app$lifecycles$i;

			(_app$lifecycles$i = app.lifecycles[i])[funcName].apply(_app$lifecycles$i, args).then(function () {
				if (i === app.lifecycles.length - 1) {
					resolve();
				} else {
					callFunc(++i);
				}
			});
		}
	});
}

function triggerAppChange() {
	var newApp = appForCurrentURL();
	if (!newApp) {
		unhandledRouteHandlers.forEach(function (handler) {
			handler(mountedApp);
		});
	}

	if (newApp !== mountedApp) {
		var appWillUnmountPromise = mountedApp ? callLifecycleFunction(mountedApp, 'applicationWillUnmount') : new Promise(function (resolve) {
			return resolve();
		});

		appWillUnmountPromise.then(function () {
			return new Promise(function (resolve) {
				if (mountedApp) {
					callLifecycleFunction(mountedApp, 'unmountApplication', mountedApp.containerEl).then(function () {
						finishUnmountingApp(mountedApp);
						resolve();
					});
				} else {
					resolve();
				}
			});
		}).then(function () {
			if (newApp.entryURI) {
				return new Promise(function (resolve) {
					return resolve();
				});
			} else {
				return loadAppForFirstTime(newApp.appLocation);
			}
		}).then(function () {
			return callLifecycleFunction(newApp, 'applicationWillMount');
		}).then(function () {
			return appWillBeMounted(newApp);
		}).then(function () {
			return callLifecycleFunction(newApp, 'mountApplication', newApp.containerEl);
		}).then(function () {
			return mountedApp = newApp;
		});
	}
}

function loadAppForFirstTime(appLocation) {
	return new Promise(function (resolve, reject) {
		var currentAppSystemGlobal = window.System;
		window.System = nativeSystemGlobal;
		nativeSystemGlobal['import'](appLocation).then(function (restOfApp) {
			registerApplication(appLocation, restOfApp.entryURI, restOfApp.lifecycles);
			var app = appLocationToApp[appLocation];
			window.System = currentAppSystemGlobal;
			callLifecycleFunction(app, 'entryWillBeInstalled').then(function () {
				return window.System['import'](app.entryURI);
			}).then(function () {
				return callLifecycleFunction(app, 'entryWasInstalled');
			}).then(function () {
				return resolve();
			});
		});
	});
}

function registerApplication(appLocation, entryURI, lifecycles) {
	//validate
	if (typeof entryURI !== 'string') {
		throw new Error('App ' + appLocation + ' must export an entryURI string');
	}
	if (typeof lifecycles !== 'object' && typeof lifecycles !== 'function') {
		throw new Error('App ' + appLocation + ' must export a \'lifecycles\' object or array of objects');
	}
	if (!Array.isArray(lifecycles)) {
		lifecycles = [lifecycles];
	}

	var _loop = function (i) {
		requiredLifeCycleFuncs.forEach(function (requiredLifeCycleFunc) {
			if (typeof lifecycles[i][requiredLifeCycleFunc] !== 'function') {
				throw new Error('In app \'' + appLocation + '\', The lifecycle at index ' + i + ' does not have required function ' + requiredLifeCycleFunc);
			}
		});
	};

	for (var i = 0; i < lifecycles.length; i++) {
		_loop(i);
	}

	//register
	var app = appLocationToApp[appLocation];
	app.entryURI = entryURI;
	app.hashChangeFunctions = [];
	app.popStateFunctions = [];
	app.lifecycles = lifecycles;
}

nativeAddEventListener('popstate', triggerAppChange);

function appForCurrentURL() {
	var appsForCurrentUrl = [];
	for (var appName in appLocationToApp) {
		var app = appLocationToApp[appName];
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
			appNames = appsForCurrentUrl.map(function (app) {
				return app.name;
			});
			throw new Error('The following applications all claim to own the location ' + window.location.href + ' -- ' + appnames.toString());
	}
}

function appWillBeMounted(app) {
	return new Promise(function (resolve) {
		app.hashChangeFunctions.forEach(function (hashChangeFunction) {
			nativeAddEventListener('hashchange', hashChangeFunction);
		});
		app.popStateFunctions.forEach(function (popStateFunction) {
			nativeAddEventListener('popstate', popStateFunction);
		});
		app.containerEl = document.createElement('div');
		app.containerEl.setAttribute('single-spa-active-app', app.appLocation);
		document.body.appendChild(app.containerEl);
		resolve();
	});
}

function finishUnmountingApp(app) {
	app.hashChangeFunctions.forEach(function (hashChangeFunction) {
		window.removeEventListener('hashchange', hashChangeFunction);
	});
	app.popStateFunctions.forEach(function (popStateFunction) {
		window.removeEventListener('popstate', popStateFunction);
	});
	document.body.removeChild(app.containerEl);
}

window.addEventListener = function (name, fn) {
	if (mountedApp) {
		if (name === 'popstate') {
			mountedApp.popStateFunctions.push(fn);
		} else if (name === 'hashchange') {
			mountedApp.hashChangeFunctions.push(fn);
		}
		nativeAddEventListener.apply(this, arguments);
	}
};
