# single-spa
[![npm version](https://img.shields.io/npm/v/single-spa.svg?style=flat-square)](https://www.npmjs.org/package/single-spa)
[![Build Status](https://img.shields.io/travis/CanopyTax/single-spa.svg?style=flat-square)](https://travis-ci.org/CanopyTax/single-spa)

Combine multiple SPAs into one SPA by implementing lifecycle functions. Allows you to:
- [Trade off between frameworks without refreshing the page](/docs/child-applications.md) (React, ng1, ng2, ember, or whatever you're using)
- [Lazy load code for improved initial load time](/docs/child-applications.md#load). This is baked in and requires no configuration.
- [Ensure that no single part of the app can break everything](/docs/application-blast-radius.md).

single-spa works in Chrome, Firefox, Safari, IE11, and Edge.

## Architectural Overview
Apps built with single-spa are made up of the following pieces:

1. An index.html file
1. A root application, in which child applications are registered. In order to register a child application, two things must be provided:
  1. The path to the application
  1. A function that determines if the application is active
1. Many child applications, each of which is like an SPA itself. Child applications respond to url routing events and must know how to bootstrap, mount, and unmount themselves from the DOM.

## Prerequistes
In order to use single-spa, you must be using a javascript [loader](https://github.com/whatwg/loader). Since loaders are not yet supported natively by browsers, you'll have to use a polyfill, such as [SystemJS](https://github.com/systemjs/systemjs).
If you're using a bundler (such as webpack or browserify) instead of a loader, or if you're using a non-standard loader (such as requirejs), check out [the migration guide](/docs/migrating-existing-spas.md)
to see your options.

## Simple Usage
*Note*: this example uses [jspm](https://github.com/jspm/jspm-cli), since it's the easiest way to set up a loader. However, jspm and systemjs are not required.
```bash
npm install -g jspm@beta
jspm init
jspm install npm:single-spa
```

Create an index.html file (see [docs](/docs/root-application.md#index.html-file) for more detail).
```html
<html>
    <head>
		<script src="jspm_packages/system.src.js"></script>
		<script src="jspm.browser.js"></script>
		<script src="jspm.config.js"></script>
        <script>
            System.import('src/main.js');
        </script>
    </head>
	<body>
		<div id="main-content"></div>
	</body>
</html>
```

Create the root application (see [docs](/docs/root-application.md) for more detail).
```js
// src/main.js
import { declareChildApplication } from "single-spa";
declareChildApplication('/apps/app1/app1.js', () => window.location.hash === '');
```

Create the child application (see [docs](/docs/child-applications.md) for more detail).
```js
document.getElementById('main-content').textContent += "App1 is loaded.";

// apps/app1/app1.js
export function bootstrap() {
	return new Promise((resolve, reject) => {
		document.getElementById('main-content').textContent += "App1 is bootstrapped.";
		resolve();
	});
}

export function mount() {
	return new Promise((resolve, reject) => {
		document.getElementById('main-content').textContent += "App1 is mounted!";
		resolve();
	});
}

export function unmount() {
	return new Promise((resolve, reject) => {
		document.getElementById('main-content').textContent = "";
		resolve();
	});
}
```

## API
See [single-spa api](/docs/single-spa-api.md) and [child application api](/docs/child-applications.md#child-application-lifecycle).

## View the demo!
A [demo is live](http://single-spa.surge.sh) on surge.sh, but is based on an old version of single-spa. The demo will soon be updated to use single-spa@2.x
