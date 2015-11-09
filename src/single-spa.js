let appLocationToApp = {};
let unhandledRouteHandlers = [];
let mountedApp;
const nativeAddEventListener = window.addEventListener;

window.singlespa = {};
window.singlespa.prependUrl = prependUrl;
window.singlespa.loader = window.System; //hard dependency on JSPM being on the page

function prependUrl(prefix, url) {
    if (!url.startsWith('/')) {
        //relative urls are taken care of by the <base> tag
        return url;
    }
    let parsedURL = document.createElement('a');
    parsedURL.href = url;
    if (parsedURL.host === window.location.host && !parsedURL.pathname.startsWith(url)) {
        return `${parsedURL.protocol}//` + `${parsedURL.hostname}:${parsedURL.port}/${prefix}/${parsedURL.pathname}${parsedURL.search}${parsedURL.hash}`.replace(/[\/]+/g, '/');
    } else {
        return url;
    }
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

    triggerAppChange(true);
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
        if (app.lifecycles.length > 0) {
            callFunc(0);
        } else {
            //nothing to do
            resolve();
        }
        function callFunc(i) {
            let funcPromise;
            if (app.lifecycles[i][funcName]) {
                funcPromise = app.lifecycles[i][funcName](...args);
            } else {
                funcPromise = new Promise((resolve) => resolve());
            }
            funcPromise
            .then(() => {
                if (i === app.lifecycles.length - 1) {
                    resolve();
                } else {
                    callFunc(++i);
                }
            })
            .catch((ex) => {
                throw ex;
            });
        }
    })
}

function triggerAppChange(appMayNotBeMountedYet) {
    let newApp = appForCurrentURL();
    if (!newApp) {
        unhandledRouteHandlers.forEach((handler) => {
            handler(mountedApp);
        });
        //nothing to do. Leave the app how it was
        if (!appMayNotBeMountedYet)
            console.warn(`No app matches the url ${window.location.toString()}, and there are no unhandledRouteHandlers`);
        return;
    }

    if (newApp !== mountedApp) {
        let oldApp = mountedApp;
        let newAppHasBeenMountedBefore = !!newApp.scriptsLoaded;

        (oldApp ? callLifecycleFunction(oldApp, 'applicationWillUnmount') : new Promise((resolve) => resolve()))
        .then(() => cleanupDom())
        .then(() => finishUnmountingApp(oldApp))
        .then(() => (oldApp ? callLifecycleFunction(oldApp, 'applicationWasUnmounted') : new Promise((resolve) => resolve())))
        .then(() => mountedApp = newApp)
        .then(() => (newAppHasBeenMountedBefore ? new Promise((resolve) => resolve()) : setupApp(newApp.appLocation)))
        .then(() => updateBaseTag(newApp.publicRoot))
        .then(() => appWillBeMounted(newApp))
        .then(() => insertDomFrom(newApp, !newAppHasBeenMountedBefore))
        .catch((ex) => {
            throw ex;
        })
    }
}

function updateBaseTag(newBaseHref) {
    return new Promise((resolve) => {
        if (document.baseURI === `${window.location.protocol}//` + `${window.location.hostname}:${window.location.port}${newBaseHref}`) {
            debugger;
            resolve();
        } else {
            newBaseHref = `/${newBaseHref}/`.replace(/[\/]+/g, '/');
            let baseTags = document.querySelectorAll('base');
            for (let i=0; i<baseTags.length; i++) {
                baseTags[i].parentNode.removeChild(baseTags[i]);
            }
            let newBase = document.createElement('base');
            newBase.setAttribute('href', newBaseHref);
            document.head.appendChild(newBase);
            resolve();
        }
    });
}

function cleanupDom() {
    return new Promise((resolve) => {
        while (document.documentElement.attributes.length > 0) {
            document.documentElement.removeAttribute(document.documentElement.attributes[0].name);
        }
        let numHeadElsToSkip = 0;
        while (document.head.childNodes.length > numHeadElsToSkip) {
            if (document.head.childNodes[numHeadElsToSkip].tagName !== 'BASE')
                document.head.removeChild(document.head.childNodes[numHeadElsToSkip]);
            else
                numHeadElsToSkip++;
        }
        while (document.body.childNodes.length > 0) {
            document.body.removeChild(document.body.childNodes[0]);
        }
        resolve();
    })
}

function insertDomFrom(app, firstTime) {
    return new Promise((resolve) => {
        const deepClone = true;
        const clonedAppDom = app.parsedDom.cloneNode(deepClone);
        const appHead = clonedAppDom.querySelector('head');
        const appBody = clonedAppDom.querySelector('body');

        (firstTime ? callLifecycleFunction(app, 'scriptsWillBeLoaded') : new Promise((resolve) => resolve()))
        .then(() => {
            if (clonedAppDom.attributes) {
                for (let i=0; i<clonedAppDom.attributes.length; i++) {
                    const attr = clonedAppDom.attributes[i];
                    document.documentElement.setAttribute(attr.name, attr.value);
                }
            }
            resolve();
        })
        .then(() => (firstTime ? insertDomPreservingScriptExecutionOrder(document.head, appHead) : insertDomNoScripts(document.head, appHead)))
        .then(firstTime ? (() => callLifecycleFunction(app, 'scriptsWereLoaded')) : new Promise((resolve) => resolve()))
        .then(() => callLifecycleFunction(app, 'applicationWillMount'))
        .then(() => (firstTime ? insertDomPreservingScriptExecutionOrder(document.body, appBody) : insertDomNoScripts(document.body, appBody)))
        .then(() => {
            return new Promise((resolve) => {
                if (firstTime) {
                    const event = document.createEvent('Event');
                    event.initEvent('DOMContentLoaded', true, true);
                    window.document.dispatchEvent(event);

                    //we only load script tags once
                    app.scriptsLoaded = true;
                    const scripts = app.parsedDom.querySelectorAll('script');
                    for (let i=0; i<scripts.length; i++) {
                        scripts[i].remove();
                    }
                }
                resolve();
            });
        })
        .then(() => callLifecycleFunction(app, 'applicationWasMounted'))
        .then(() => resolve())
        .catch((ex) => {
            throw ex;
        });
    });
}

function insertDomNoScripts(where, what) {
    return new Promise((resolve) => {
        while (what.childNodes.length > 0) {
            where.appendChild(what.childNodes[0]);
        }
        resolve();
    });
}

function insertDomPreservingScriptExecutionOrder(where, what) {
    return new Promise((rootResolve) => {
        //Time to get fancy -- we need to load scripts synchronously before proceeding to the next html element
        iterateThroughNode();

        function iterateThroughNode(index) {
            if (what.childNodes.length > 0) {
                traverseNode(where, what.childNodes[0])
                .then(() => iterateThroughNode())
                .catch((ex) => {
                    throw ex;
                });
            } else {
                rootResolve();
            }
        }

        function traverseNode(domLocation, node) {
            return new Promise((resolve) => {
                /* 1. Append node without any of it's children
                 * 2. Traverse the children one by one
                 */

                const children = [];
                let nodeAppendedPromise;
                let appendedNode;
                if (node.tagName === 'SCRIPT') {
                    //one does not simply append script tags
                    nodeAppendedPromise = new Promise((resolve) => {
                        const originalScriptTag = node;
                        const scriptTag = document.createElement('script');
                        for (let i=0; i<originalScriptTag.attributes.length; i++) {
                            scriptTag.setAttribute(originalScriptTag.attributes[i].nodeName, originalScriptTag.getAttribute(originalScriptTag.attributes[i].nodeName));
                        }
                        if (!scriptTag.src) {
                            scriptTag.text = originalScriptTag.text;
                        }
                        while (originalScriptTag.childNodes.length > 0) {
                            originalScriptTag.removeChild(originalScriptTag.childNodes[0]);
                        }
                        originalScriptTag.remove();
                        domLocation.appendChild(scriptTag);
                        appendedNode = scriptTag;
                        if (scriptTag.src && (!scriptTag.type || scriptTag.type === 'text/javascript')) {
                            scriptTag.onload = () => {
                                resolve();
                            }
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
                    nodeAppendedPromise = new Promise((resolve) => {
                        appendedNode = domLocation.appendChild(node);
                        resolve();
                    });
                }

                //traverse the children
                nodeAppendedPromise
                .then(() => traverseChildren())
                .then(() => resolve())
                .catch((ex) => {
                    throw ex;
                });

                function traverseChildren() {
                    return new Promise((resolve) => {
                        traverseChild()
                        function traverseChild() {
                            if (children.length === 0) {
                                resolve();
                            } else {
                                traverseNode(node, children.shift())
                                .then(() => traverseChild(node, children))
                                .catch((ex) => {
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
    return new Promise(function(resolve, reject) {
        var currentAppSystemGlobal = window.System;
        window.System = window.singlespa.loader;
        window.singlespa.loader.import(appLocation).then(function(restOfApp) {
            registerApplication(appLocation, restOfApp.publicRoot, restOfApp.pathToIndex, restOfApp.lifecycles);
            let app = appLocationToApp[appLocation];
            window.System = currentAppSystemGlobal;
            loadIndex(app)
            .then(() => resolve())
            .catch((ex) => {
                throw ex;
            });
        })
        .catch((ex) => {
            throw ex;
        })
    })
}

function loadIndex(app) {
    return new Promise((resolve) => {
        let request = new XMLHttpRequest();
        request.addEventListener('load', htmlLoaded);
        request.open('GET', `${window.location.protocol}//${window.location.hostname}:${window.location.port}` + `/${app.publicRoot}/${app.pathToIndex}`.replace(/\/\//g, '/'));
        request.send();

        function htmlLoaded() {
            let parser = new DOMParser();
            let dom = parser.parseFromString(this.responseText, 'text/html');

            app.parsedDom = dom;
            resolve();

        }
    });
}

function registerApplication(appLocation, publicRoot, pathToIndex, lifecycles) {
    //validate
    if (typeof publicRoot !== 'string') {
        throw new Error(`App ${appLocation} must export a publicRoot string`);
    }
    if (typeof pathToIndex !== 'string') {
        throw new Error(`App ${appLocation} must export a pathToIndex string`);
    }
    if (typeof lifecycles !== 'object' && typeof lifecycles !== 'function') {
        throw new Error(`App ${appLocation} must export a 'lifecycles' object or array of objects`);
    }
    if (!Array.isArray(lifecycles)) {
        lifecycles = [lifecycles];
    }

    //register
    let app = appLocationToApp[appLocation];
    app.publicRoot = publicRoot;
    app.pathToIndex = pathToIndex;
    app.windowEventListeners = {};
    app.lifecycles = lifecycles;
}

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
        throw new Error(`The following applications all claim to own the location ${window.location.href} -- ${appNames.toString()}`)
    }
}

function appWillBeMounted(app) {
    return new Promise((resolve) => {
        for (let eventName in app.windowEventListeners) {
            for (let i=0; i<app.windowEventListeners[eventName].length; i++)
                nativeAddEventListener(eventName, app.windowEventListeners[eventName][i]);
        }
        resolve();
    })
}

function finishUnmountingApp(app) {
    return new Promise((resolve) => {
        if (app) {
            for (let eventName in app.windowEventListeners) {
                for (let i=0; i<app.windowEventListeners[eventName].length; i++)
                    window.removeEventListener(eventName, app.windowEventListeners[eventName][i]);
            }
        }
        resolve();
    })
}

window.addEventListener = function(name, fn) {
    if (mountedApp) {
        if (!mountedApp.windowEventListeners[name]) {
            mountedApp.windowEventListeners[name] = [];
        }
        mountedApp.windowEventListeners[name].push(fn);
    }
    nativeAddEventListener.apply(this, arguments);
}

function addEventsToAnchors() {
    setTimeout(function() {
        const aTags = document.querySelectorAll('a:not([singlespa])');
        for (let i=0; i<aTags.length; i++) {
            aTags[i].addEventListener('click', anchorClicked);
            aTags[i].setAttribute('singlespa', '');
        }
        addEventsToAnchors();
    }, 40)
}

addEventsToAnchors();

function anchorClicked(event) {
    if (this.getAttribute('href') && this.getAttribute('href').indexOf('#') === 0) {
        //the browser will prepend the href with whatever is in the <base> tag, which is not desirable
        window.location.hash = this.getAttribute('href');
        event.preventDefault();
    } else {
        const externalLink = window.location.host !== this.host || window.location.protocol !== this.protocol;
        if (externalLink) {
            //do the default thing
            return;
        } else {
            //change the url
            window.history.pushState(undefined, '', this.href);
            //check if that means that we need to change the app
            const appNeedsToChange = appForCurrentURL() !== mountedApp;
            if (!appNeedsToChange) {
                //do the default thing
                return;
            } else {
                //only preventDefault when we're sure that single-spa is the sole handler of this event
                event.preventDefault();
                setTimeout(() => triggerAppChange(), 2);
            }

        }
    }
}
