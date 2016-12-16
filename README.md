# single-spa
[![npm version](https://img.shields.io/npm/v/single-spa.svg?style=flat-square)](https://www.npmjs.org/package/single-spa)
[![Build Status](https://img.shields.io/travis/CanopyTax/single-spa.svg?style=flat-square)](https://travis-ci.org/CanopyTax/single-spa)

**A javascript metaframework**

Combine multiple SPAs into one SPA by implementing lifecycle functions. This allows you to:
- [Use multiple frameworks on the same page](/docs/single-spa-ecosystem.md#help-for-frameworks) [without refreshing the page](/docs/child-applications.md)
  (React, Angular 1, Angular 2, Ember, or whatever you're using)
- Write code using a new framework, without rewriting your existing app
- Lazy load code for improved initial load time.
- Hot load entire chunks of your overall application (instead of individual files).

## Demo and examples
A [live demo](https://single-spa.surge.sh) is available and the source code for that demo is available in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples) repository.

## Architectural Overview
Single-spa takes inspiration from React component lifecycles by applying lifecycles to entire applications.
It started out of a desire to use React + react-router instead of being forever stuck with our Angular 1 + ui-router application, 
but now single-spa supports almost any framework coexisting with any other. Since Javascript is notorious for the short-life of its
many frameworks, we decided to make it easy to use whichever frameworks you want.

Apps built with single-spa are made up of the following pieces:

1. Many [child applications](/docs/child-applications.md), each of which can be a distinct SPA. Child applications respond to url routing events
   and must know how to bootstrap, mount, and unmount themselves from the DOM.
   For example, your React or Angular applications are child applications which are either active or dormant. When active, they listen to url routing events
   and put content on the DOM. When dormant, they do not listen to url routing events and are totally removed from the DOM.
1. A [root application](/docs/root-application.md) where child applications are registered. Each child application is registered with three things:
  1. A name
  1. A function to load the child application's code
  1. A function that determines when the child application is active/dormant.

## How hard will it be to use single-spa?
single-spa works with es5, es6+, typescript, webpack, systemjs, gulp, grunt, bower, or really anything build system you can think of. You can npm
install it, jspm install it, or even just use a `<script>` tag if you prefer. If you're not starting your application from scratch, you'll have to [migrate
your SPA](/docs/migrating-existing-spas.md) to become a single-spa child application.

single-spa works in Chrome, Firefox, Safari, IE11, and Edge.

## Isn't single-spa sort of a redundant name?
Yep

## Documentation
See the [docs](/docs). If you're looking for help with specific frameworks or build systems (React, Angular, Webpack, etc), check out the [ecosystem wiki](https://github.com/CanopyTax/single-spa/blob/master/docs/single-spa-ecosystem.md)

Also, check out [this step by step guide](https://medium.com/@joeldenning/a-step-by-step-guide-to-single-spa-abbbcb1bedc6).

## Simple Usage
*Note*: this example uses [jspm](https://github.com/jspm/jspm-cli), but check out the [ecosystem documentation](/docs/single-spa-ecosystem.md#help-for-frameworks) to see how
to set everything up with webpack or other build systems.
```bash
npm install -g jspm@beta
jspm init
jspm install npm:single-spa
```

Create an index.html file (see [docs](/docs/root-application.md#indexhtml-file) for more detail).
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
import { declareChildApplication, start } from "single-spa";
declareChildApplication('app1', () => System.import('/apps/app1.js'), () => window.location.hash === '');
start()
```

Create the child application (see [docs](/docs/child-applications.md) for more detail).
```js
document.getElementById('main-content').textContent += "App1 is loaded.";

// apps/app1.js
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
