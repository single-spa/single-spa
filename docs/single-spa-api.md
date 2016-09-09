# single-spa API
The single-spa library does not `export default`, but instead exports named functions and variables.

## start
`start()` is a function that must be called by your root application. Before `start` is called, child
applications will be loaded, but will never be bootstrapped, mounted or unmounted.

## declareChildApplication
`declareChildApplication(name, activeWhen)` is the most important api your root application will use.
It is described in detail inside of the [root-application.md docs](/docs/root-application.md#declaring-child-applications)

## triggerAppChange
`triggerAppChange()` takes in no arguments and returns a Promise that will resolve/reject when all apps that
should be mounted are mounted, etc.

## navigateToUrl
`navigateToUrl(obj)` takes in one optional argument and returns no value. It is a utility function that
allows for easy url navigation between child applications, without needing to deal with `event.preventDefault()`,
`pushState`, `triggerAppChange()`, etc. It can be called with one of the following:

- a string parameter `url`
- a context / thisArg that has an `href` property (useful for `singleSpaNavigate.call(anchorElement)` case).
- a DOMEvent object for a click event on a DOMElement that has an `href` attribute
  (ideal for the `<a onclick="singleSpaNavigate"></a>` use case).

This function is exposed onto the window as `window.singleSpaNavigate`, for convenience.

## getMountedApps
`getMountedApps()` returns an array of strings, where each string is the name of the child application,
as defined in the call to `declareChildApplication`.

## getAppStatus
`getAppStatus(appName)` takes in one string parameter and returns either a string (when the app exists)
or `null` (when the app doesn't exist). The string status is one of the following:

- `NOT_BOOTSTRAPPED`: this app's source code isn't even loaded yet.
- `LOADING_SOURCE_CODE`: this app's source code is being fetched.
- `BOOTSTRAPPING`: the `bootstrap` lifecycle function has been called, but has not yet finished.
- `NOT_MOUNTED`: the app has been loaded and bootstrapped, but is not currently mounted.
- `MOUNTING`: the app is being mounted, but has not finished.
- `MOUNTED`: the app is currently active and is mounted to the DOM.
- `UNMOUNTING`: the app is currently being unmounted, but has not yet finished.
- `SKIP_BECAUSE_BROKEN`: the app threw an error during load, bootstrap, mount, or unmount and has been
   siloed because it is misbehaving. Other apps may continue on normally, but this one will be skipped.

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
`dieOnTimeout` refers to configuration of what should happen when child applications take longer than expected
to load, bootstrap, mount, or unmount. There is both a global configuration applicable to all child applications, and also
the ability for each child application to override this behavior for itself. See [child application configuration
for timeouts](/docs/child-applications.md#timeouts) for details on child application overrides of the global
behavior.

If `dieOnTimeout` is false (which is the default), child applications that are slowing things down will cause
nothing more than some warnings in the console up until `millis` is reached.

If `dieOnTimeout` is true, child applications that are slowing things down will be siloed into a SKIP_BECAUSE_BROKEN
status where they will never again be given the chance to break everything.

## setLoader (deprecated)
`setLoader(Loader)` sets the javascript [loader](https://whatwg.github.io/loader/) that will be used by single-spa.
A loader must implement `Loader.import(...).then(...).catch(...)`, and the most commonly used loader is
[SystemJS](https://github.com/systemjs/systemjs). This API should be called **before** any `declareChildApplication`
calls are made. Once called, you may omit the [loading function](/docs/root-application.md#loading-function) argument when
calling `declareChildApplication` and single-spa will assume that a child application may be loaded with
`Loader.import(childAppName).then(childApp => ...)`
