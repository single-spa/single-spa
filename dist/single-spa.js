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
var requiredLifeCycleFuncs = ['scriptsWillBeLoaded', 'scriptsWereLoaded', 'applicationWillMount', 'applicationWasMounted', 'applicationWillUnmount', 'applicationWasUnmounted', 'activeApplicationSourceWillUpdate', 'activeApplicationSourceWillUpdate'];

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

		(mountedApp ? callLifecycleFunction(mountedApp, 'applicationWillUnmount') : new Promise(function (resolve) {
			return resolve();
		})).then(function () {
			return cleanupDom();
		}).then(function () {
			return finishUnmountingApp(mountedApp);
		}).then(function () {
			return mountedApp ? callLifecycleFunction(mountedApp, 'applicationWasUnmounted') : new Promise(function (resolve) {
				return resolve();
			});
		}).then(function () {
			return newApp.scriptsLoaded ? new Promise(function (resolve) {
				return resolve();
			}) : loadAppForFirstTime(newApp.appLocation);
		}).then(function () {
			return callLifecycleFunction(newApp, 'applicationWillMount');
		}).then(function () {
			return appWillBeMounted(newApp);
		}).then(function () {
			return insertDomFrom(newApp);
		}).then(function () {
			return callLifecycleFunction(newApp, 'applicationWasMounted');
		}).then(function () {
			return mountedApp = newApp;
		});
	}
}

function cleanupDom() {
	return new Promise(function (resolve) {
		while (document.head.childNodes.length > 0) {
			document.head.removeChild(document.head.childNodes[0]);
		}
		while (document.body.childNodes.length > 0) {
			document.body.removeChild(document.body.childNodes[0]);
		}
		resolve();
	});
}

function insertDomFrom(app) {
	return new Promise(function (resolve) {
		var deepClone = true;
		var clonedAppDom = app.parsedDom.cloneNode(deepClone);

		for (var i = 0; i < clonedAppDom.attributes.length; i++) {
			var attr = clonedAppDom.attributes[i];
			document.documentElement.setAttribute(attr.name, attr.value);
		}

		var appHead = app.parsedDom.querySelector('head');
		while (appHead.childNodes.length > 0) {
			document.head.appendChild(appHead.childNodes[0]);
		}

		var appBody = app.parsedDom.querySelector('body');
		while (appBody.childNodes.length > 0) {
			document.body.appendChild(appBody.childNodes[0]);
		}

		app.parsedDom = clonedAppDom;
		resolve();
	});
}

function loadAppForFirstTime(appLocation) {
	return new Promise(function (resolve, reject) {
		var currentAppSystemGlobal = window.System;
		window.System = nativeSystemGlobal;
		nativeSystemGlobal['import'](appLocation).then(function (restOfApp) {
			registerApplication(appLocation, restOfApp.publicRoot, restOfApp.pathToIndex, restOfApp.lifecycles);
			var app = appLocationToApp[appLocation];
			window.System = currentAppSystemGlobal;
			callLifecycleFunction(app, 'scriptsWillBeLoaded').then(function () {
				return loadIndex(app);
			}).then(function () {
				return callLifecycleFunction(app, 'scriptsWereLoaded');
			}).then(function () {
				return resolve();
			});
		});
	});
}

function loadIndex(app) {
	return new Promise(function (resolve) {
		var request = new XMLHttpRequest();
		request.addEventListener('load', htmlLoaded);
		request.open('GET', window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/' + app.publicRoot + '/' + app.pathToIndex);
		request.send();

		function htmlLoaded() {
			var parser = new DOMParser();
			var dom = parser.parseFromString(this.responseText, 'text/html');
			var isLoadingScript = false;
			var scriptsToBeLoaded = [];

			traverseNode(dom);
			app.parsedDom = dom.documentElement;
			if (app.scriptsLoaded) {
				setTimeout(function () {
					resolve();
				}, 10);
			}

			function traverseNode(node) {
				for (var i = 0; i < node.childNodes.length; i++) {
					var child = node.childNodes[i];
					if (child.tagName === 'SCRIPT') {
						if (child.getAttribute('src')) {
							child.setAttribute('src', prependURL(child.getAttribute('src'), app.publicRoot));
						}
						//we put the scripts onto the page as part of the scriptsLoaded lifecycle
						scriptsToBeLoaded.push(child);
						appendScriptTag();
					} else if (child.tagName === 'LINK' && child.getAttribute('href')) {
						child.setAttribute('href', prependURL(child.getAttribute('href'), app.publicRoot));
					} else if (child.tagName === 'IMG' && child.getAttribute('src')) {
						child.setAttribute('src', prependURL(child.getAttribute('src'), app.publicRoot));
					}
					traverseNode(child);
				}
			}

			function prependURL(url, prefix) {
				var parsedURL = document.createElement('a');
				parsedURL.href = url;
				var result = parsedURL.protocol + '//' + (parsedURL.hostname + ':' + parsedURL.port + '/' + prefix + '/' + parsedURL.pathname + parsedURL.search + parsedURL.hash).replace(/[\/]+/g, '/');
				return result;
			}

			function appendScriptTag() {
				if (isLoadingScript) {
					return;
				}
				if (scriptsToBeLoaded.length === 0) {
					app.scriptsLoaded = true;
					if (app.parsedDom) {
						//loading a script was the last thing we were waiting on
						setTimeout(function () {
							resolve();
						}, 10);
					}
					return;
				}
				var originalScriptTag = scriptsToBeLoaded.splice(0, 1)[0];
				//one does not simply append script tags to the dom
				var scriptTag = document.createElement('script');
				for (var i = 0; i < originalScriptTag.attributes.length; i++) {
					scriptTag.setAttribute(originalScriptTag.attributes[i].nodeName, originalScriptTag.getAttribute(originalScriptTag.attributes[i].nodeName));
				}
				if (!scriptTag.src) {
					scriptTag.text = originalScriptTag.text;
				}
				isLoadingScript = true;
				document.head.appendChild(scriptTag);
				if (scriptTag.src) {
					scriptTag.onload = function () {
						isLoadingScript = false;
						appendScriptTag();
					};
				} else {
					isLoadingScript = false;
					appendScriptTag();
				}
				//normally when you appendChild, the old parent no longer has the child anymore. We have to simulate that since we're not really appending the child
				originalScriptTag.remove();
			}
		}
	});
}

function registerApplication(appLocation, publicRoot, pathToIndex, lifecycles) {
	//validate
	if (typeof publicRoot !== 'string') {
		throw new Error('App ' + appLocation + ' must export a publicRoot string');
	}
	if (typeof pathToIndex !== 'string') {
		throw new Error('App ' + appLocation + ' must export a pathToIndex string');
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
	app.publicRoot = publicRoot;
	app.pathToIndex = pathToIndex;
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
		resolve();
	});
}

function finishUnmountingApp(app) {
	return new Promise(function (resolve) {
		if (!app) {
			resolve();
			return;
		}
		app.hashChangeFunctions.forEach(function (hashChangeFunction) {
			window.removeEventListener('hashchange', hashChangeFunction);
		});
		app.popStateFunctions.forEach(function (popStateFunction) {
			window.removeEventListener('popstate', popStateFunction);
		});
		resolve();
	});
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
