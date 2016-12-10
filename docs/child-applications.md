# Child applications

A single-spa child application is everything that a normal SPA is, except that it doesn't have an HTML page.
In a single-spa world, your SPA contains many child applications, where each has its own framework.
Child applications have their own client-side routing and their own frameworks/libraries.
They render their own html and have full freedom to do whatever they want, whenever they are *mounted*.
The concept of being *mounted* refers to whether a child application is putting content on the DOM or not.
What determines if a child application is mounted is its [activity function](/docs/root-application.md#activity-function).
Whenever a child application is *not mounted*, it should remain completely dormant until mounted.

## Creating a child application

To create a child application, first
[register the application with single-spa](/docs/root-application.md#declaring-child-applications).
Once registered, the child application must correctly implement **all** of the following lifecycle functions
inside of its main entry point.

## Child application lifecycle
During the course of a single-spa app, child applications are loaded, initialized (bootstrapped), mounted, unmounted, and unloaded.
single-spa provides hooks into each phase via `lifecycles`.

A lifecycle function is a function or array of functions that single-spa will call on a child application.
Lifecycle functions are exported from the main entry point of a child application.

Notes:
- Lifecycle functions are not called with any arguments.
- Implementing `bootstrap`, `mount`, and `unmount` is required. But implementing `unload` is optional.
- Each lifecycle function must either return a `Promise` or be an `async function`.
- If an array of functions is exported (instead of just one function), the functions will be called
  one-after-the-other, waiting for the resolution of one function's promise before calling the next.
- If single-spa is [not started](/docs/single-spa-api.md#start), applications will be loaded,
  but will not be bootstrapped, mounted or unmounted.

### Lifecycle middleware
Middleware that helps implement lifecycle functions for specific frameworks, libraries, and applications
is available for many popular technologies. See [the ecosystem docs](/docs/single-spa-ecosystem.md) for details.

### load
When child applications are being lazily loaded, this refers to when the code for a child application
is fetched from the server and executed. This will happen once the child application's [activity function](/docs/root-application.md#activity-function)
returns a truthy value for the first time. It is best practice to do as little as possible / nothing at all
during `load`, but instead to wait until the bootstrap lifecycle function to do anything.
If you need to do something during `load`, simply put the code into a child application's main entry point,
but not inside of an exported function.

For example:
```js
console.log("The child application has been loaded!");
System.import('./path-to-some-file-i-want-to-execute');

export async function bootstrap() {...}
export async function mount() {...}
export async function unmount() {...}
```

### bootstrap
This lifecycle function will be called once, right before the child application is
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

### unload
The `unload` lifecycle is an optionally implemented lifecycle function. It will be called whenever an application should be
`unloaded`. This will not ever happen unless someone calls the [`unloadChildApplication`](/docs/single-spa-api.md#unloadchildapplication) API.
If a child application does not implement the unload lifecycle, then it assumed that unloading the app is a no-op.

The purpose of the `unload` lifecycle is to perform logic right before a single-spa application is unloaded. Once
the application is unloaded, the application status will be NOT_LOADED and the application will be re-bootstrapped.

The motivation for `unload` was to implement the hot-loading of entire child applications, but it is useful in other
scenarios as well when you want to re-bootstrap applications, but perform some logic before applications are re-bootstrapped.

```js
export function unload() {
  return new Promise((resolve, reject) => {
    console.log('unloading');
    resolve();
  })
}
```

```js
export const unload = [
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
  unload: {
    millis: 5000,
	dieOnTimeout: true,
  },
};
```
