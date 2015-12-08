'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.declareChildApplication = declareChildApplication;
exports.addUnhandledRouteHandler = addUnhandledRouteHandler;
exports.updateApplicationSourceCode = updateApplicationSourceCode;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

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
                }) : setupApp(newApp.appLocation);
            }).then(function () {
                return updateBaseTag(newApp.publicRoot);
            }).then(function () {
                return appWillBeMounted(newApp);
            }).then(function () {
                return insertDomFrom(newApp, !newAppHasBeenMountedBefore);
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
        var appHead = clonedAppDom.querySelector('head');
        var appBody = clonedAppDom.querySelector('body');

        (firstTime ? callLifecycleFunction(app, 'scriptsWillBeLoaded') : new Promise(function (resolve) {
            return resolve();
        })).then(function () {
            if (clonedAppDom.attributes) {
                for (var i = 0; i < clonedAppDom.attributes.length; i++) {
                    var attr = clonedAppDom.attributes[i];
                    document.documentElement.setAttribute(attr.name, attr.value);
                }
            }
            resolve();
        }).then(function () {
            return firstTime ? insertDomPreservingScriptExecutionOrder(document.head, appHead) : insertDomNoScripts(document.head, appHead);
        }).then(firstTime ? function () {
            return callLifecycleFunction(app, 'scriptsWereLoaded');
        } : new Promise(function (resolve) {
            return resolve();
        })).then(function () {
            return callLifecycleFunction(app, 'applicationWillMount');
        }).then(function () {
            return firstTime ? insertDomPreservingScriptExecutionOrder(document.body, appBody) : insertDomNoScripts(document.body, appBody);
        }).then(function () {
            return new Promise(function (resolve) {
                if (firstTime) {
                    var event = document.createEvent('Event');
                    event.initEvent('DOMContentLoaded', true, true);
                    window.document.dispatchEvent(event);

                    //we only load script tags once
                    app.scriptsLoaded = true;
                    var scripts = app.parsedDom.querySelectorAll('script');
                    for (var i = 0; i < scripts.length; i++) {
                        scripts[i].parentNode.removeChild(scripts[i]);
                    }
                }
                resolve();
            });
        }).then(function () {
            return callLifecycleFunction(app, 'applicationWasMounted');
        }).then(function () {
            return resolve();
        }).catch(function (ex) {
            throw ex;
        });
    });
}

function insertDomNoScripts(where, what) {
    return new Promise(function (resolve) {
        while (what.childNodes.length > 0) {
            where.appendChild(what.childNodes[0]);
        }
        resolve();
    });
}

function insertDomPreservingScriptExecutionOrder(where, what) {
    return new Promise(function (rootResolve) {
        //Time to get fancy -- we need to load scripts synchronously before proceeding to the next html element
        iterateThroughNode();

        function iterateThroughNode(index) {
            if (what.childNodes.length > 0) {
                traverseNode(where, what.childNodes[0]).then(function () {
                    return iterateThroughNode();
                }).catch(function (ex) {
                    throw ex;
                });
            } else {
                rootResolve();
            }
        }

        function traverseNode(domLocation, node) {
            return new Promise(function (resolve) {
                /* 1. Append node without any of it's children
                 * 2. Traverse the children one by one
                 */

                var children = [];
                var nodeAppendedPromise = undefined;
                var appendedNode = undefined;
                if (node.tagName === 'SCRIPT') {
                    //one does not simply append script tags
                    nodeAppendedPromise = new Promise(function (resolve) {
                        var originalScriptTag = node;
                        var scriptTag = document.createElement('script');
                        for (var i = 0; i < originalScriptTag.attributes.length; i++) {
                            scriptTag.setAttribute(originalScriptTag.attributes[i].nodeName, originalScriptTag.getAttribute(originalScriptTag.attributes[i].nodeName));
                        }
                        if (!scriptTag.src) {
                            scriptTag.text = originalScriptTag.text;
                        }
                        while (originalScriptTag.childNodes.length > 0) {
                            originalScriptTag.removeChild(originalScriptTag.childNodes[0]);
                        }
                        originalScriptTag.parentNode.removeChild(originalScriptTag);
                        domLocation.appendChild(scriptTag);
                        appendedNode = scriptTag;
                        if (scriptTag.src && (!scriptTag.type || scriptTag.type === 'text/javascript')) {
                            scriptTag.onload = function () {
                                resolve();
                            };
                        } else {
                            resolve();
                        }
                    });
                } else {
                    //remove the children
                    while (node.childNodes.length > 0) {
                        children.push(node.removeChild(node.childNodes[0]));
                    }

                    //append
                    nodeAppendedPromise = new Promise(function (resolve) {
                        appendedNode = domLocation.appendChild(node);
                        resolve();
                    });
                }

                //traverse the children
                nodeAppendedPromise.then(function () {
                    return traverseChildren();
                }).then(function () {
                    return resolve();
                }).catch(function (ex) {
                    throw ex;
                });

                function traverseChildren() {
                    return new Promise(function (resolve) {
                        traverseChild();
                        function traverseChild() {
                            if (children.length === 0) {
                                resolve();
                            } else {
                                traverseNode(node, children.shift()).then(function () {
                                    return traverseChild(node, children);
                                }).catch(function (ex) {
                                    throw ex;
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}

function setupApp(appLocation) {
    return new Promise(function (resolve, reject) {
        var currentAppSystemGlobal = window.System;
        window.System = window.singlespa.loader;
        window.singlespa.loader.import(appLocation).then(function (restOfApp) {
            registerApplication(appLocation, restOfApp.publicRoot, restOfApp.pathToIndex, restOfApp.lifecycles);
            var app = appLocationToApp[appLocation];
            window.System = currentAppSystemGlobal;
            loadIndex(app).then(function () {
                return resolve();
            }).catch(function (ex) {
                throw ex;
            });
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

            app.parsedDom = document.importNode(dom.documentElement, true);
            resolve();
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

var anchorAddedObserver = new MutationObserver(function (mutations) {
    //my guess is that it is faster just to do one querySelectorAll instead of iterating through the mutations
    var links = document.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
        var a = links[i];
        if (!a.singlespa) {
            a.singlespa = true;
            a.addEventListener('click', anchorClicked);
        }
    }
});

anchorAddedObserver.observe(document, {
    subtree: true,
    childList: true,
    characterData: true
});

function anchorClicked(event) {
    if (this.getAttribute('href') && this.getAttribute('href').indexOf('#') === 0) {
        //the browser will prepend the href with whatever is in the <base> tag, which is not desirable
        window.location.hash = this.getAttribute('href');
        event.preventDefault();
    } else {
        var externalLink = window.location.host !== this.host || window.location.protocol !== this.protocol;
        if (externalLink) {
            //do the default thing
            return;
        } else {
            //change the url
            window.history.pushState(undefined, '', this.href);
            //check if that means that we need to change the app
            var appNeedsToChange = appForCurrentURL() !== mountedApp;
            if (!appNeedsToChange) {
                //do the default thing
                return;
            } else {
                //only preventDefault when we're sure that single-spa is the sole handler of this event
                event.preventDefault();
                setTimeout(function () {
                    return triggerAppChange();
                }, 2);
            }
        }
    }
}

//# sourceMappingURL=single-spa.js.map