'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.declareChildApplication = declareChildApplication;
exports.addUnhandledRouteHandler = addUnhandledRouteHandler;
exports.updateApplicationSourceCode = updateApplicationSourceCode;

function _typeof(obj) { return obj && obj.constructor === Symbol ? "symbol" : typeof obj; }

var appLocationToApp = {};
var unhandledRouteHandlers = [];
var mountedApp = undefined;
var nativeAddEventListener = window.addEventListener;

window.singlespa = {};
window.singlespa.prependUrl = prependUrl;
window.singlespa.loader = window.System; //hard dependency on JSPM being on the page

function prependUrl(prefix, url) {
    if (!url.startsWith('/')) {
        //relative urls are taken care of by the <base> tag
        return url;
    }
    var parsedURL = document.createElement('a');
    parsedURL.href = url;
    if (parsedURL.host === window.location.host && !parsedURL.pathname.startsWith(url)) {
        return parsedURL.protocol + '//' + (parsedURL.hostname + ':' + parsedURL.port + '/' + prefix + '/' + parsedURL.pathname + parsedURL.search + parsedURL.hash).replace(/[\/]+/g, '/');
    } else {
        return url;
    }
}

function declareChildApplication(appLocation, activeWhen) {
    if (typeof appLocation !== 'string' || appLocation.length === 0) throw new Error('The first argument must be a non-empty string \'appLocation\'');
    if (typeof activeWhen !== 'function') throw new Error('The second argument must be a function \'activeWhen\'');
    if (appLocationToApp[appLocation]) throw new Error('There is already an app declared at location ' + appLocation);

    appLocationToApp[appLocation] = {
        appLocation: appLocation,
        activeWhen: activeWhen,
        parentApp: mountedApp ? mountedApp.appLocation : null
    };

    triggerAppChange(true);
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
        if (app.lifecycles.length > 0) {
            callFunc(0);
        } else {
            //nothing to do
            resolve();
        }
        function callFunc(i) {
            var funcPromise = undefined;
            if (app.lifecycles[i][funcName]) {
                var _app$lifecycles$i;

                funcPromise = (_app$lifecycles$i = app.lifecycles[i])[funcName].apply(_app$lifecycles$i, args);
            } else {
                funcPromise = new Promise(function (resolve) {
                    return resolve();
                });
            }
            funcPromise.then(function () {
                if (i === app.lifecycles.length - 1) {
                    resolve();
                } else {
                    callFunc(++i);
                }
            }).catch(function (ex) {
                throw ex;
            });
        }
    });
}

function triggerAppChange(appMayNotBeMountedYet) {
    var newApp = appForCurrentURL();
    if (!newApp) {
        unhandledRouteHandlers.forEach(function (handler) {
            handler(mountedApp);
        });
        //nothing to do. Leave the app how it was
        if (!appMayNotBeMountedYet) console.warn('No app matches the url ' + window.location.toString() + ', and there are no unhandledRouteHandlers');
        return;
    }

    if (newApp !== mountedApp) {
        (function () {
            var oldApp = mountedApp;
            var newAppHasBeenMountedBefore = !!newApp.scriptsLoaded;

            (oldApp ? callLifecycleFunction(oldApp, 'applicationWillUnmount') : new Promise(function (resolve) {
                return resolve();
            })).then(function () {
                return cleanupDom();
            }).then(function () {
                return finishUnmountingApp(oldApp);
            }).then(function () {
                return oldApp ? callLifecycleFunction(oldApp, 'applicationWasUnmounted') : new Promise(function (resolve) {
                    return resolve();
                });
            }).then(function () {
                return mountedApp = newApp;
            }).then(function () {
                return newAppHasBeenMountedBefore ? new Promise(function (resolve) {
                    return resolve();
                }) : loadAppForFirstTime(newApp.appLocation);
            }).then(function () {
                return updateBaseTag(newApp.publicRoot);
            }).then(function () {
                return callLifecycleFunction(newApp, 'applicationWillMount');
            }).then(function () {
                return appWillBeMounted(newApp);
            }).then(function () {
                return insertDomFrom(newApp, !newAppHasBeenMountedBefore);
            }).then(function () {
                return callLifecycleFunction(newApp, 'applicationWasMounted');
            }).catch(function (ex) {
                throw ex;
            });
        })();
    }
}

function updateBaseTag(newBaseHref) {
    return new Promise(function (resolve) {
        if (document.baseURI === window.location.protocol + '//' + (window.location.hostname + ':' + window.location.port + newBaseHref)) {
            debugger;
            resolve();
        } else {
            newBaseHref = ('/' + newBaseHref + '/').replace(/[\/]+/g, '/');
            var baseTags = document.querySelectorAll('base');
            for (var i = 0; i < baseTags.length; i++) {
                baseTags[i].parentNode.removeChild(baseTags[i]);
            }
            var newBase = document.createElement('base');
            newBase.setAttribute('href', newBaseHref);
            document.head.appendChild(newBase);
            resolve();
        }
    });
}

function cleanupDom() {
    return new Promise(function (resolve) {
        while (document.documentElement.attributes.length > 0) {
            document.documentElement.removeAttribute(document.documentElement.attributes[0].name);
        }
        var numHeadElsToSkip = 0;
        while (document.head.childNodes.length > numHeadElsToSkip) {
            if (document.head.childNodes[numHeadElsToSkip].tagName !== 'BASE') document.head.removeChild(document.head.childNodes[numHeadElsToSkip]);else numHeadElsToSkip++;
        }
        while (document.body.childNodes.length > 0) {
            document.body.removeChild(document.body.childNodes[0]);
        }
        resolve();
    });
}

function insertDomFrom(app, firstTime) {
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

        if (firstTime) {
            var event = document.createEvent('Event');
            event.initEvent('DOMContentLoaded', true, true);
            window.document.dispatchEvent(event);
        }

        resolve();
    });
}

function loadAppForFirstTime(appLocation) {
    return new Promise(function (resolve, reject) {
        var currentAppSystemGlobal = window.System;
        window.System = window.singlespa.loader;
        window.singlespa.loader.import(appLocation).then(function (restOfApp) {
            registerApplication(appLocation, restOfApp.publicRoot, restOfApp.pathToIndex, restOfApp.lifecycles);
            var app = appLocationToApp[appLocation];
            window.System = currentAppSystemGlobal;
            updateBaseTag(app.publicRoot).then(function () {
                return callLifecycleFunction(app, 'scriptsWillBeLoaded');
            }).then(function () {
                return loadIndex(app);
            }).then(function () {
                return callLifecycleFunction(app, 'scriptsWereLoaded');
            }).then(function () {
                return resolve();
            }).catch(function (ex) {
                throw ex;
            });;
        }).catch(function (ex) {
            throw ex;
        });
    });
}

function loadIndex(app) {
    return new Promise(function (resolve) {
        var request = new XMLHttpRequest();
        request.addEventListener('load', htmlLoaded);
        request.open('GET', window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + ('/' + app.publicRoot + '/' + app.pathToIndex).replace(/\/\//g, '/'));
        request.send();

        function htmlLoaded() {
            var parser = new DOMParser();
            var dom = parser.parseFromString(this.responseText, 'text/html');
            var isLoadingScript = false;
            var scriptsToBeLoaded = [];

            //for when there ain't no scripts to load, we default to all scripts being loaded
            app.scriptsLoaded = true;

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
                        scriptsToBeLoaded.push(child);
                        appendScriptTag();
                    }
                    traverseNode(child);
                }
            }

            function appendScriptTag() {
                app.scriptsLoaded = false;
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
                if (scriptTag.src && (!scriptTag.type || scriptTag.type === 'text/javascript')) {
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
    if ((typeof lifecycles === 'undefined' ? 'undefined' : _typeof(lifecycles)) !== 'object' && typeof lifecycles !== 'function') {
        throw new Error('App ' + appLocation + ' must export a \'lifecycles\' object or array of objects');
    }
    if (!Array.isArray(lifecycles)) {
        lifecycles = [lifecycles];
    }

    //register
    var app = appLocationToApp[appLocation];
    app.publicRoot = publicRoot;
    app.pathToIndex = pathToIndex;
    app.windowEventListeners = {};
    app.lifecycles = lifecycles;
}

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
            throw new Error('The following applications all claim to own the location ' + window.location.href + ' -- ' + appNames.toString());
    }
}

function appWillBeMounted(app) {
    return new Promise(function (resolve) {
        for (var eventName in app.windowEventListeners) {
            for (var i = 0; i < app.windowEventListeners[eventName].length; i++) {
                nativeAddEventListener(eventName, app.windowEventListeners[eventName][i]);
            }
        }
        resolve();
    });
}

function finishUnmountingApp(app) {
    return new Promise(function (resolve) {
        if (app) {
            for (var eventName in app.windowEventListeners) {
                for (var i = 0; i < app.windowEventListeners[eventName].length; i++) {
                    window.removeEventListener(eventName, app.windowEventListeners[eventName][i]);
                }
            }
        }
        resolve();
    });
}

window.addEventListener = function (name, fn) {
    if (mountedApp) {
        if (!mountedApp.windowEventListeners[name]) {
            mountedApp.windowEventListeners[name] = [];
        }
        mountedApp.windowEventListeners[name].push(fn);
    }
    nativeAddEventListener.apply(this, arguments);
};

function addEventsToAnchors() {
    setTimeout(function () {
        var aTags = document.querySelectorAll('a:not([singlespa])');
        for (var i = 0; i < aTags.length; i++) {
            aTags[i].addEventListener('click', anchorClicked);
            aTags[i].setAttribute('singlespa', '');
        }
        addEventsToAnchors();
    }, 12);
}

addEventsToAnchors();

function anchorClicked(event) {
    if (window.location.host !== this.host || window.location.protocol !== this.protocol) {
        //do the default thing
        return;
    } else {
        event.preventDefault();
        if (this.getAttribute('href').startsWith('#')) {
            window.location.hash = this.getAttribute('href');
        } else {
            window.history.pushState(undefined, '', this.href);
            //calling pushState programatically doesn't fire the popstate event
            setTimeout(triggerAppChange(), 2);
        }
    }
}

//# sourceMappingURL=single-spa.js.map