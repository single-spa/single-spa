# single-spa

[![npm version](https://img.shields.io/npm/v/single-spa.svg?style=flat-square)](https://www.npmjs.org/package/single-spa)
[![Build Status](https://img.shields.io/travis/CanopyTax/single-spa/master.svg?style=flat-square)](https://travis-ci.org/CanopyTax/single-spa)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/joeldenning.svg)](https://saucelabs.com/u/joeldenning)

[Join the chat on Slack](https://join.slack.com/t/single-spa/shared_invite/enQtMzIwMTcxNTU3ODQyLTM1Y2U1OWMzNTNjOWYyZDBlMDJhN2VkYzk3MDI2NzQ2Nzg0MzMzNjVhNWE2YjVhMTcxNjFkOWYzMjllMmUxMjk)

## A javascript metaframework

Build micro frontends that coexist and can each be written with their own framework. This allows you to:
- [Use multiple frameworks](/docs/single-spa-ecosystem.md#help-for-frameworks) on the same page [without refreshing the page](/docs/applications.md)
  ([React](https://github.com/CanopyTax/single-spa-react), [AngularJS](https://github.com/CanopyTax/single-spa-angular1), [Angular](https://github.com/CanopyTax/single-spa-angular2), [Ember](https://github.com/CanopyTax/single-spa-ember), or whatever you're using)
- Write code using a new framework, without rewriting your existing app
- Lazy load code for improved initial load time.

## Demo and examples
A [live demo](https://single-spa.surge.sh) is available and the source code for that demo is available in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples) repository.

Also, you can check out [a simple webpack starter project](https://github.com/joeldenning/simple-single-spa-webpack-example) which is simpler and hopefully easier to get started with.

## Architectural Overview
Single-spa takes inspiration from React component lifecycles by applying lifecycles to entire applications.
It started out of a desire to use React + react-router instead of being forever stuck with our AngularJS + ui-router application, but now single-spa supports almost any framework coexisting with any other. Since Javascript is notorious for the short-life of its many frameworks, we decided to make it easy to use whichever frameworks you want.

Apps built with single-spa are made up of the following pieces:

1. Many [applications](/docs/applications.md), each of which is sort of like an entire SPA itself. Applications respond to url routing events and must know how to bootstrap, mount, and unmount themselves from the DOM. The main difference between a SPA and an application is that applications must coexist together and do not each have their own html page.
  For example, your React or Angular applications are applications which are either active or dormant. When active, they listen to url routing events and put content on the DOM. When dormant, they do not listen to url routing events and are totally removed from the DOM.
2. A [single-spa-config](/docs/single-spa-config.md). The single-spa-config is the html page, plus the javascript that registers applications with single-spa. Each application is registered with three things:
    1. A name
    2. A function to load the application's code
    3. A function that determines when the application is active/dormant.

## How hard will it be to use single-spa?
single-spa works with es5, es6+, typescript, webpack, systemjs, gulp, grunt, bower, ember-cli, or really anything build system you can think of. You can npm install it, jspm install it, or even just use a `<script>` tag if you prefer. If you're not starting your application from scratch, you'll have to [migrate your SPA](/docs/migrating-existing-spas.md) to become a single-spa application.

single-spa works in Chrome, Firefox, Safari, IE11, and Edge.

## Isn't single-spa sort of a redundant name?
Yep

## Documentation
See the [docs](/docs). If you're looking for help with specific frameworks or build systems (React, Angular, Webpack, Ember, etc), check out the [ecosystem wiki](https://github.com/CanopyTax/single-spa/blob/master/docs/single-spa-ecosystem.md)

Also, check out [this step by step guide](https://medium.com/@joeldenning/a-step-by-step-guide-to-single-spa-abbbcb1bedc6).

## Simple Usage
For a full example, check out [this simple webpack example](https://github.com/joeldenning/simple-single-spa-webpack-example).

To create a single-spa application, you will need to do three things:

1. Create an html file:
```html
<html>
<body>
	<script src="single-spa-config.js"></script>
</body>
</html>
```

2. Create a single-spa-config. Check out the [docs](https://github.com/CanopyTax/single-spa/blob/master/docs/single-spa-config.md) for more detail.

```js
// single-spa-config.js
import * as singleSpa from 'single-spa';

const appName = 'app1';

/* The loading function is a function that returns a promise that resolves with the javascript application module.
 * The purpose of it is to facilitate lazy loading -- single-spa will not download the code for a application until it needs to.
 * In this example, import() is supported in webpack and returns a Promise, but single-spa works with any loading function that returns a Promise.
 */
const loadingFunction = () => import('./app1/app1.js');

/* Single-spa does some top-level routing to determine which application is active for any url. You can implement this routing any way you'd like.
 * One useful convention might be to prefix the url with the name of the app that is active, to keep your top-level routing simple.
 */
const activityFunction = location => location.pathname.startsWith('/app1');

singleSpa.registerApplication(appName, loadingFunction, activityFunction);
singleSpa.start();
```

3. Create an application. Check out the [docs](https://github.com/CanopyTax/single-spa/blob/master/docs/applications.md) for more detail.
```js
//app1.js

let domEl;

export function bootstrap(props) {
	return Promise
		.resolve()
		.then(() => {
			domEl = document.createElement('div');
			domEl.id = 'app1';
			document.body.appendChild(domEl);
		});
}

export function mount(props) {
	return Promise
		.resolve()
		.then(() => {
			// This is where you would normally use a framework to mount some ui to the dom. See https://github.com/CanopyTax/single-spa/blob/master/docs/single-spa-ecosystem.md.
			domEl.textContent = 'App 1 is mounted!'
		});
}

export function unmount(props) {
	return Promise
		.resolve()
		.then(() => {
			// This is normally where you would tell the framework to unmount the ui from the dom. See https://github.com/CanopyTax/single-spa/blob/master/docs/single-spa-ecosystem.md
			domEl.textContent = '';
		})
}
```

## Project roadmap
We're trying out github's Projects feature ([here](https://github.com/CanopyTax/single-spa/projects)) and are keeping it up-to-date with the fancy things in the works for single-spa.

## API
See [single-spa api](/docs/single-spa-api.md) and [application api](/docs/applications.md#application-lifecycle).

## Who's Using This?
Please submit a P.R. to this section if you start using single-spa.

- [CanopyTax](https://www.canopytax.com)
- [Dealer Socket](https://dealersocket.com/)
- [Beamery](https://beamery.com/)
