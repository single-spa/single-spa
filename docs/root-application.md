# Root application
The single-spa root application consists of all code that is not part of a
[child application](/docs/child-applications.md). Ideally, this only includes an html file
and a javascript file that declares single-spa child applications. It is best practice to keep your
root application as small as possible and to simply defer to single-spa to manage
all of the child applications. The root application should not be doing client-side html
rendering nor should it be responding to routing events such as `hashchange` or `popstate`.
Instead, all of that functionality should be taken care of either by single-spa itself or by
a child application.

## Index.html file
The main thing that you should be doing in your html file is executing your root application. For your
use case, this could mean something like `<script src="/root-application.js"></script>`.
Example:
```js
<html>
  <body>
    <script src="/root-application.js"></script>
  </body>
</html>
```

## Declaring child applications

Declaring a [child application](/docs/child-applications.md) is registering it with single-spa so that it will be loaded,
initialized, mounted, and unmounted at the right times. Declaration most commonly occurs inside of the root application, but
does not have to. Note that if a child application is declared from within another child application, that no hierarchy
will be maintained between the child applications. Instead, the child applications will be siblings and will be mounted
and unmounted according to their own activity functions.

In order to declare a child application, call the `declareChildApplication(name, howToLoad, activityFunction)` api. Example:

```js
// root-application.js
import { declareChildApplication, start } from 'single-spa';

declareChildApplication("childApplicationName", loadingFunction, activityFunction);
start();

function loadingFunction() {
  return import("src/app1/main.js");
}

function activityFunction(location) {
  return location.hash.indexOf("#/app1/") === 0;
}
```

### Child application name
The first argument to `declareChildApplication` must be a string name.

### Loading function
The second argument to `declareChildApplication` must be a function that returns a promise (or an ["async function"](https://ponyfoo.com/articles/understanding-javascript-async-await)).
The function will be called with no arguments when it's time to load the child application for the first time. The returned
promise must be resolved with the child application. The most common implementation of a loading function is an import call:
`() => import('/path/to/child-application.js')`

### Activity function
The third argument to `declareChildApplication` must be a pure function, the function is provided `window.location` as the first argument, and returns a truthy
value whenever the child application should be active. Most commonly, the activity function determines if a child application
is active by looking at `window.location`/the first param.

Another way of looking at this is that single-spa is a top-level router that has a lot of child applications that have their own sub-router.

single-spa will call each child application's activity function under the following scenarios:
- `hashchange` or `popstate` event
- `pushState` or `replaceState` is called
- [`triggerAppChange`](/docs/single-spa-api.md#triggerappchange) api is called on single-spa
- Whenever the `checkActivityFunctions` method is called

## Calling singleSpa.start()
The [`start()` api](/docs/single-spa-api.md#start) **must** be called by your root application in order for child
applications to actually be mounted. Before `start` is called, child applications will be loaded, but not bootstrapped/mounted/unmounted.
The reason for `start` is to give you control over performance. For example, you may want to declare child applications
immediately (to start downloading the code for the active ones), but not actually mount the child applications
until an initial AJAX request (maybe to get information about the logged in user) has been completed. In that case,
the best performance is achieved by calling `declareChildApplication` immediately, but calling `start` after
the AJAX request is completed.

```js
//root-application.js
import { start } from 'single-spa';

/* Calling start before declaring child apps means that single-spa can immediately mount apps, without
 * waiting for any initial setup of the single page app.
 */
start();

// Declare child applications....
```

## Two child applications simultaneously??
Yep, it's possible. And it's actually not that scary if you do it right. And once you do,
it's really really powerful. One approach to do this is to create a `<div id="app-name"></div>` for each app,
so that they never try to modify the same DOM at the same time.
