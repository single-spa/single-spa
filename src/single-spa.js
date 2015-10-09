let appLocationToApp = {};
let unhandledRouteHandlers = [];
let mountedApp;
const nativeAddEventListener = window.addEventListener;
const urlLoader = new LoaderPolyfill();
const nativeSystemGlobal = window.System;
const requiredLifeCycleFuncs = [
    'scriptsWillBeLoaded',
    'scriptsWereLoaded',
    'applicationWillMount',
    'applicationWasMounted',
    'applicationWillUnmount',
    'applicationWasUnmounted',
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
        //nothing to do. Leave the app how it was
        console.warn(`No app matches the url ${window.location.toString()}, and there are no unhandledRouteHandlers`);
        return;
    }

    if (newApp !== mountedApp) {

        (mountedApp ? callLifecycleFunction(mountedApp, 'applicationWillUnmount') : new Promise((resolve) => resolve()))
        .then(() => cleanupDom())
        .then(() => finishUnmountingApp(mountedApp))
        .then(() => (mountedApp ? callLifecycleFunction(mountedApp, 'applicationWasUnmounted') : new Promise((resolve) => resolve())))
        .then(() => (newApp.scriptsLoaded ? new Promise((resolve) => resolve()) : loadAppForFirstTime(newApp.appLocation)))
        .then(() => callLifecycleFunction(newApp, 'applicationWillMount'))
        .then(() => appWillBeMounted(newApp))
        .then(() => insertDomFrom(newApp))
        .then(() => callLifecycleFunction(newApp, 'applicationWasMounted'))
        .then(() => mountedApp = newApp)
    }
}

function cleanupDom() {
    return new Promise((resolve) => {
        while (document.head.childNodes.length > 0) {
            document.head.removeChild(document.head.childNodes[0]);
        }
        while (document.body.childNodes.length > 0) {
            document.body.removeChild(document.body.childNodes[0]);
        }
        resolve();
    })
}

function insertDomFrom(app) {
    return new Promise((resolve) => {
        const deepClone = true;
        let clonedAppDom = app.parsedDom.cloneNode(deepClone);

        for (let i=0; i<clonedAppDom.attributes.length; i++) {
            const attr = clonedAppDom.attributes[i];
            document.documentElement.setAttribute(attr.name, attr.value);
        }

        let appHead = app.parsedDom.querySelector('head');
        while (appHead.childNodes.length > 0) {
            document.head.appendChild(appHead.childNodes[0]);
        }

        let appBody = app.parsedDom.querySelector('body');
        while (appBody.childNodes.length > 0) {
            document.body.appendChild(appBody.childNodes[0]);
        }

        app.parsedDom = clonedAppDom;
        resolve();
    })
}

function loadAppForFirstTime(appLocation) {
    return new Promise(function(resolve, reject) {
        var currentAppSystemGlobal = window.System;
        window.System = nativeSystemGlobal;
        nativeSystemGlobal.import(appLocation).then(function(restOfApp) {
            registerApplication(appLocation, restOfApp.publicRoot, restOfApp.pathToIndex, restOfApp.lifecycles);
            let app = appLocationToApp[appLocation];
            window.System = currentAppSystemGlobal;
            callLifecycleFunction(app, 'scriptsWillBeLoaded')
            .then(() => loadIndex(app))
            .then(() => callLifecycleFunction(app, 'scriptsWereLoaded'))
            .then(() => resolve())
        })
    })
}

function loadIndex(app) {
    return new Promise((resolve) => {
        let request = new XMLHttpRequest();
        request.addEventListener('load', htmlLoaded);
        request.open('GET', `${window.location.protocol}//${window.location.hostname}:${window.location.port}/${app.publicRoot}/${app.pathToIndex}`);
        request.send();

        function htmlLoaded() {
            let parser = new DOMParser();
            let dom = parser.parseFromString(this.responseText, 'text/html');
            let isLoadingScript = false;
            let scriptsToBeLoaded = [];

            traverseNode(dom);
            app.parsedDom = dom.documentElement;
            if (app.scriptsLoaded) {
                setTimeout(function() {
                    resolve();
                }, 10)
            }

            function traverseNode(node) {
                for (let i=0; i<node.childNodes.length; i++) {
                    const child = node.childNodes[i];
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
                let parsedURL = document.createElement('a');
                parsedURL.href = url;
                let result = `${parsedURL.protocol}//` + `${parsedURL.hostname}:${parsedURL.port}/${prefix}/${parsedURL.pathname}${parsedURL.search}${parsedURL.hash}`.replace(/[\/]+/g, '/');
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
                        setTimeout(function() {
                            resolve();
                        }, 10)
                    }
                    return;
                }
                let originalScriptTag = scriptsToBeLoaded.splice(0, 1)[0];
                //one does not simply append script tags to the dom
                let scriptTag = document.createElement('script');
                for (let i=0; i<originalScriptTag.attributes.length; i++) {
                    scriptTag.setAttribute(originalScriptTag.attributes[i].nodeName, originalScriptTag.getAttribute(originalScriptTag.attributes[i].nodeName));
                }
                if (!scriptTag.src) {
                    scriptTag.text = originalScriptTag.text;
                }
                isLoadingScript = true;
                document.head.appendChild(scriptTag);
                if (scriptTag.src) {
                    scriptTag.onload = () => {
                        isLoadingScript = false;
                        appendScriptTag();
                    }
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
    for (let i=0; i<lifecycles.length; i++) {
        requiredLifeCycleFuncs.forEach((requiredLifeCycleFunc) => {
            if (typeof lifecycles[i][requiredLifeCycleFunc] !== 'function') {
                throw new Error(`In app '${appLocation}', The lifecycle at index ${i} does not have required function ${requiredLifeCycleFunc}`);
            }
        });
    }

    //register
    let app = appLocationToApp[appLocation];
    app.publicRoot = publicRoot;
    app.pathToIndex = pathToIndex;
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
        resolve();
    })
}

function finishUnmountingApp(app) {
    return new Promise((resolve) => {
        if (!app) {
            resolve()
            return;
        }
        app.hashChangeFunctions.forEach((hashChangeFunction) => {
            window.removeEventListener('hashchange', hashChangeFunction);
        });
        app.popStateFunctions.forEach((popStateFunction) => {
            window.removeEventListener('popstate', popStateFunction);
        });
        resolve();
    })
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
