# single-spa ecosystem
The ecosystem around single-spa is still new, but there are already some
great projects that make things better.

## Help for frameworks
There are a growing number of projects that help you bootstrap, mount,
and unmount applications written with popular frameworks. Feel free
to contribute to this list with your own project:

- [single-spa-angular1](https://github.com/CanopyTax/single-spa-angular1)
- [single-spa-react](https://github.com/CanopyTax/single-spa-react) (no special
  configuration for react-router is needed)

## SystemJS
Since SystemJS is a Promise-based [loader](https://whatwg.github.io/loader), the way to
lazy load your child applications is straightforward:

```js
import { declareChildApplication } from 'single-spa';

// Import the child application with a SystemJS.import call
declareChildApplication('app-name-1', () => SystemJS.import('./my-child-app.js'), activeWhen);

// Alternatively, use the more out-of-date System.import (instead of SystemJS.import)
declareChildApplication('app-name-2', () => System.import('./my-other-child-app.js'), activeWhen);

function activeWhen() {
	return window.location.hash.indexOf('#/my-child-app') === 0;
}
```

## Webpack 2
With webpack 2, we can take advantage of it's support for [code splitting with System.import](https://webpack.github.io/docs/code-splitting.html)
in order to easily lazy-load child applications when they are needed. When registering
child applications from inside of your root application, try the following for your
[loading functions](/docs/root-application.md#loading-function).
```js
import { declareChildApplication } from 'single-spa';

declareChildApplication('app-name', () => System.import('./my-child-app.js'), activeWhen);
// Or es5 version:
// declareChildApplication('app-name', function() { return System.import('./my-child-app.js') }, activeWhen)

function activeWhen() {
	return window.location.hash.indexOf('#/my-child-app') === 0;
}
```

## Webpack 1
With webpack 1, there is no support for Promise-based code splitting. Instead, we have to either wrap
a require.ensure in a Promise, or just give up on lazy loading completely.

```js
import { declareChildApplication } from 'single-spa';
import app1 from './app1'; // Not lazy loading with code splitting :(

// Giving up on lazy loading and code splitting :(
declareChildApplication('app-1', () => Promise.resolve(app1), activeWhen);

// Still doing code splitting! But verbose :(
declareChildApplication('app-2', app2InPromise, activeWhen);

/* Unfortunately, this logic cannot be abstracted into a generic
 * function that handles wrapping require.ensure in a promise for
 * any dynamically imported module. This is because webpack needs to
 * be able to statically analyze the code and find all of the require.ensure
 * calls at build-time, so you can't pass variables into require.ensure.
 */
function app2InPromise() {
	return new Promise((resolve, reject) => {
		require.ensure(['./app-2.js'], require => {
			try {
				resolve(require(app2));
			} catch(err) {
				reject(err);
			}
		});
	});
}	

function activeWhen() {
	return window.location.hash.indexOf('#/my-child-app') === 0;
}
```
