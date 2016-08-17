# Child applications

A single-spa child application is everything that a normal SPA is, except that it doesn't have an HTML page.
In a single-spa world, your app might contain many child applications, each with their own framework.
Child applications have their own client-side routing and their own frameworks/libraries.
They render their own html and have full freedom to do whatever they want, whenever they are *mounted*.
The concept of being *mounted* refers to whether a child application's
[activity function](/docs/root-application.md#activity-function) returns a truthy value at any given time.
Whenever a child application is *not mounted*, it should remain completely dormant until mounted.

## Creating a child application

To create a child application, first
[register the application with single-spa](/docs/root-application.md#declaring-child-applications).
Once registered, the child application must correctly implement **all** of the following lifecycle functions
inside of its main entry point.

## Child application lifecycle
During the course of a single-spa app, child applications are loaded, initialized, mounted, and remounted.
single-spa provides hooks into the latter three lifecycle events via lifecycle functions. In order to
hook into the `load` lifecycle, simply put code into the application that is run without a function being
called.

A lifecycle function is a function or array of functions that single-spa will call on a child application.
Lifecycle functions are exported from the main entry point of a child application.

Notes:
- Lifecycle functions are not called with any arguments.
- All lifecycle functions currently must be implemented by every child application.
- Each lifecycle function must either return a `Promise` or be an `async function`.
- If an array of functions is exported (instead of just one function), the functions will be called
  one-after-the-other, waiting for the resolution of one function's promise before calling the next.
- If single-spa is [not started](/docs/single-spa-api.md#start), applications will be loaded and bootstrapped
  but will not be mounted or unmounted.

### Lifecycle middleware
Middleware that helps implement lifecycle functions for specific frameworks, libraries, and applications
is available for many popular technologies. See [middleware docs](/docs/single-spa-ecosystem.md) for details.

### load
Although this is not a lifecycle function at all, `load` is an important part of any child application's
lifecycle. It refers to when the code for a child application is fetched from the server and executed.
The code for a child application is *always* lazy loaded by single-spa and will only be fetched from
the server once the child application's [activity function](/docs/root-application.md#activity-function)
returns a truthy value for the first time. It is best practice to do as little as possible / nothing at all
during `load`, but instead to wait until the bootstrap lifecycle function to do anything.
If you need to do something during `load`, simply put the code into a child application's main entry point,
but not inside of an exported function.

For example:
```js
console.log("The child application has been loaded!");
require('./path-to-some-file-i-want-to-execute');

export function bootstrap() {...}
export function mount() {...}
export function unmount() {...}
```

### bootstrap
This lifecycle function will be called exactly once, right before the child application is
mounted for the first time.

```js
export function bootstrap() {
  return new Promise((resolve, reject) => {
    resolve();
  })
}
```

```js
export const bootstrap = [
  function firstThing() {
    return new Promise((resolve, reject) => {
      resolve();
    })
  },
  function secondThing() {
    return new Promise((resolve, reject) => {
      resolve();
    })
  }
];
```

### mount
This lifecycle function will be called whenever the child application is not mounted, but its
[activity function](/docs/root-application.md#activity-function) returns a truthy value. When
called, this function should look at the URL to determine the active route and then create
DOM elements, DOM event listeners, etc. to render content to the user. Any subsequent routing
events (such as `hashchange` and `popstate`) will **not** trigger more calls to `mount`, but
instead should be handled by the childl application itself.

```js
export function mount() {
  return new Promise((resolve, reject) => {
    resolve();
  })
}
```

```js
export const mount = [
  function firstThing() {
    return new Promise((resolve, reject) => {
      resolve();
    })
  },
  function secondThing() {
    return new Promise((resolve, reject) => {
      resolve();
    })
  }
];
```

### unmount
This lifecycle function will be called whenever the child application is mounted, but its
[activity function](/docs/root-application.md#activity-function) returns a falsy value. When
called, this function should clean up all DOM elements, DOM event listeners, leaked memory, globals,
observable subscriptions, etc. that were created at any point when the child application was mounted.

```js
export function unmount() {
  return new Promise((resolve, reject) => {
    resolve();
  })
}
```

```js
export const unmount = [
  function firstThing() {
    return new Promise((resolve, reject) => {
      resolve();
    })
  },
  function secondThing() {
    return new Promise((resolve, reject) => {
      resolve();
    })
  }
];
```

## Timeouts
By default, child applications obey the [global dieOnTimeout configuration](/docs/single-spa-api.md#dieontimeout),
but can override that behavior for their specific application. This is done by exporting a `timeouts` object
from the main entry point of the child application. Example:

```js
// app-1.main-entry.js

export function bootstrap() {...}
export function mount() {...}
export function unmount() {...}

export const timeouts = {
  bootstrap: {
    millis: 5000,
    dieOnTimeout: true,
  },
  mount: {
    millis: 5000,
    dieOnTimeout: false,
  },
  unmount: {
    millis: 5000,
    dieOnTimeout: true,
  },
};
```
