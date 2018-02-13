# single-spa API
The single-spa library does not `export default`, but instead exports named functions and variables.
What this means is you can use the api in two ways:

```js
import * as singleSpa from 'single-spa';
// OR
import {registerApplication, start} from 'single-spa';
```

## registerApplication
`registerApplication(name, whereToGetApplication, activeWhen)` is the most important api your single spa config will use.
It is described in detail inside of the [single-spa-config.md docs](/docs/single-spa-config.md#registering-applications)

## declareChildApplication
`declareChildApplication` is deprecated use `registerApplication` instead

## start
`start()` is a function that must be called by your single spa config. Before `start` is called, 
applications will be loaded, but will never be bootstrapped, mounted or unmounted. The reason for `start`
is to give you control over the performance of your single page application. For example, you may want to declare registered applications
immediately (to start downloading the code for the active ones), but not actually mount the registered applications
until an initial AJAX request (maybe to get information about the logged in user) has been completed. In that case,
the best performance is achieved by calling `registerApplication` immediately, but calling `start` after
the AJAX request is completed.

## triggerAppChange
`triggerAppChange()` takes in no arguments and returns a Promise that will resolve/reject when all apps have mounted.

## navigateToUrl
`navigateToUrl(obj)` takes in one optional argument and returns no value. It is a utility function that
allows for easy url navigation between registered applications, without needing to deal with `event.preventDefault()`,
`pushState`, `triggerAppChange()`, etc. It can be called with one of the following:

- a string parameter `url`
- a context / thisArg that has an `href` property (useful for `singleSpaNavigate.call(anchorElement)` case).
- a DOMEvent object for a click event on a DOMElement that has an `href` attribute
  (ideal for the `<a onclick="singleSpaNavigate"></a>` use case).

This function is exposed onto the window as `window.singleSpaNavigate`, for convenience and use inside of `<button onclick="singleSpaNavigate('url')">` or `<a href="/url" onclick="singleSpaNavigate">`

## getMountedApps
`getMountedApps()` returns an array of strings, where each string is the name of the registered application,
as defined in the call to `registerApplication`.

## getAppNames
`getAppNames()` returns an array of strings, where each string is the name of the registered application. NOTE: this returns all declared registered applications regardless of app status.

## getAppStatus
`getAppStatus(appName)` takes in one string parameter and returns either a string (when the app exists)
or `null` (when the app doesn't exist). The string status is one of the following:

- `NOT_LOADED`: the app has been registered with single-spa, but the app itself has not yet been loaded.
- `LOADING_SOURCE_CODE`: the app's source code is being fetched.
- `NOT_BOOTSTRAPPED`: the app has been loaded, but not yet bootstrapped.
- `BOOTSTRAPPING`: the `bootstrap` lifecycle function has been called, but has not yet finished.
- `NOT_MOUNTED`: the app has been loaded and bootstrapped, but is not currently mounted.
- `MOUNTING`: the app is being mounted, but has not finished.
- `MOUNTED`: the app is currently active and is mounted to the DOM.
- `UNMOUNTING`: the app is currently being unmounted, but has not yet finished.
- `UNLOADING`: the app is currently being unloaded, but has not yet finished.
- `SKIP_BECAUSE_BROKEN`: the app threw an error during load, bootstrap, mount, or unmount and has been
   siloed because it is misbehaving. Other apps may continue on normally, but this one will be skipped.

## unloadApplication
`unloadApplication(appName, opts)` takes in a string parameter `appName` and (optionally) an `opts` object. It returns
a promise that is resolved when the registered application has been successfully resolved. The `opts` parameter is an object with the
following property:
- `waitForUnmount`: a boolean that decides when to unload the application. Defaults to false.

Examples:
```js
unloadApplication('app1', {waitForUnmount: false});
unloadApplication('app1'); // This is the same as providing `{waitForUnmount: false}`

unloadApplication('app1', {waitForUnmount: true});
```

The purpose of unloading a registered application is to set it back to to a NOT_LOADED status, which means that
it will be re-bootstrapped the next time it needs to mount. The motivation for this was to allow for
the hot-reloading of entire registered applications, but `unload` can be useful whenever you want to re-bootstrap
your application.

Single-spa performs the following steps when unloadApplication is called.
1. Call the [unload lifecyle](/docs/applications.md#unload) on the registered application that is being unloaded.
2. Set the app status to NOT_LOADED
3. Trigger a reroute, during which single-spa will potentially mount the application that was just unloaded.

Because a registered application might be mounted when `unloadApplication` is called, you can specify whether you want to immediately
unload or if you want to wait until the application is no longer mounted. This is done with the `waitForUnmount` option. If `false`,
single-spa immediately unloads the specified registered application even if the app is currently mounted. If `true`, single-spa will unload
the registered application as soon as it is safe to do so (when the app status is not `MOUNTED`).

## unloadChildApplication
`unloadChildApplication` is deprecated use `unloadApplication` instead

## checkActivityFunctions
`checkActivityFunctions(mockWindowLocation)` takes in a mock of the `window.location`. It returns an array of
`applicationName` strings. This API will call every app's activity function with the provided mockWindowLocation

## addErrorHandler
`addErrorHandler(fn)` adds a handler that will be called every time an application throws an error during a lifecycle function or an
activity function. When there are no error handlers, single-spa throws the error to the window, but when there is at least one handler,
errors will no longer be thrown on the window.

The `fn` must be a function. It will be called with one argument, `err`, which is an Error object that has a `message` and `name` property.

## removeErrorHandler
`removeErrorHandler(fn)` removes an error handler. Returns true if the error handler was removed, and false if it was not.

## before routing event
single-spa fires an event `single-spa:before-routing-event` on the window every time before a routing event occurs.
This event will get fired after each hashchange, popstate, or triggerAppChange, even if no changes
to registered applications were necessary. Sample usage of this event might look like this:
```js
window.addEventListener('single-spa:before-routing-event', () => {
	console.log('before routing event occurred!');
})
```

## routing event
single-spa fires an event `single-spa:routing-event` on the window every time that a routing event has occurred in which
single-spa verified that all apps were correctly loaded, bootstrapped, mounted, and unmounted.
This event will get fired after each hashchange, popstate, or triggerAppChange, even if no changes
to registered applications were necessary. Sample usage of this event might look like this:
```js
window.addEventListener('single-spa:routing-event', () => {
	console.log('routing event occurred!');
})
```

## app-change event
single-spa fires an event `single-spa:app-change` on the window every time that one or more apps were loaded, bootstrapped,
mounted, unmounted, or unloaded. It is similar to `single-spa:routing-event` except that it will not fire unless
one or more apps were actually loaded, bootstrapped, mounted, or unmounted. A hashchange, popstate, or triggerAppChange
that does not result in one of those changes will not cause the event to be fired.
Sample usage of this event might look like this:
```js
window.addEventListener('single-spa:app-change', () => {
	console.log(singleSpa.getMountedApps())
})
```

## no-app-change event
When no apps were loaded, bootstrapped, mounted, unmounted, or unloaded, single-spa fires a `single-spa:no-app-change` event.
This is the converse of the `single-spa:app-change` event -- only one will be fired for each routing event.
```js
window.addEventListener('single-spa:no-app-change', () => {
	console.log(singleSpa.getMountedApps())
})
```

## before-first-mount
Right before the first time that any app is mounted, single-spa fires a `single-spa:before-first-mount` event. This will happen
after the app is already loaded, but before it is mounted. This event will only get fired once, ever. It does *not* get fired for each
app's first mount, but rather for the first time that any of the apps is mounted.
```js
window.addEventListener('single-spa:before-first-mount', () => {
	console.log('Suggested use case: remove a loader bar that the user is seeing right before the first app will be mounted');
});
```

## first-mount
Right after the first time that any app is mounted, single-spa fires a `single-spa:first-mount` event. This event will only get fired once, ever.
It does *not* get fired for each app's first mount, but rather for the first time that any of the apps is mounted.
```js
window.addEventListener('single-spa:first-mount', () => {
	console.log('Suggested use case: log the time it took before the user sees any of the apps mounted');
});
```

## ensureJQuerySupport
`ensureJQuerySupport(jQuery)`: Since jquery does event delegation, single-spa
has to specifically monkey patch each version of jQuery that you're using. single-spa tries to do
this automatically as much as possible for looking for window.jQuery or window.$, but if you want
to give your version of jQuery to single-spa manually, call ensureJQuerySupport(jQuery). The
jQuery argument is actually optional and will default to window.jQuery.

## setBootstrapMaxTime
`setBootstrapMaxTime(millis, dieOnTimeout = false)` takes in a number of milliseconds and a boolean dieOnTimeout
that defaults to false. It sets the global configuration for bootstrap timeouts and does not return any value.
See dieOnTimeout section below for details.

## setMountMaxTime
`setMountMaxTime(millis, dieOnTimeout = false)` takes in a number of milliseconds and a boolean dieOnTimeout
that defaults to false. It sets the global configuration for mount timeouts and does not return any value.
See dieOnTimeout section below for details.

## setUnmountMaxTime
`setUnmountMaxTime(millis, dieOnTimeout = false)` takes in a number of milliseconds and a boolean dieOnTimeout
that defaults to false. It sets the global configuration for unmount timeouts and does not return any value.
See dieOnTimeout section below for details.

## dieOnTimeout
`dieOnTimeout` refers to configuration of what should happen when registered applications take longer than expected
to load, bootstrap, mount, or unmount. There is both a global configuration applicable to all registered applications, and also
the ability for each registered application to override this behavior for itself. See [registered application configuration
for timeouts](/docs/applications.md#timeouts) for details on registered application overrides of the global
behavior.

If `dieOnTimeout` is false (which is the default), registered applications that are slowing things down will cause
nothing more than some warnings in the console up until `millis` is reached.

If `dieOnTimeout` is true, registered applications that are slowing things down will be siloed into a SKIP_BECAUSE_BROKEN
status where they will never again be given the chance to break everything.

## setLoader (deprecated)
`setLoader(Loader)` sets the javascript [loader](https://whatwg.github.io/loader/) that will be used by single-spa.
A loader must implement `Loader.import(...).then(...).catch(...)`, and the most commonly used loader is
[SystemJS](https://github.com/systemjs/systemjs). This API should be called **before** any `registerApplication`
calls are made. Once called, you may omit the [loading function](/docs/single-spa-config.md#loading-function) argument when
calling `registerApplication` and single-spa will assume that a registered application may be loaded with
`Loader.import(appName).then(app => ...)`
