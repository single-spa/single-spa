# single-spa

Multiple applications all lazily loaded and mounted/unmounted in the same single page application (SPA). The apps can be deployed independently to your web server of choice, lazy-loaded onto the page independently, and nested. Single-spa also allows for **service oriented javascript**, where a "service" (a shared es6 module) is a singleton that each app can call, without resorting to shared libraries that can be out of sync across apps.

In this context, an application is an html document that pulls in JS, CSS, and more HTML. This means that many pre-existing applications do not need to change at all in order to work with single-spa. You just need to add a configuration file on top of your existing SPA.

## View the demo!
A [demo is live](http://single-spa.surge.sh) on surge.sh. Don't be turned off by the lack of styling -- I'll be fixing that soon. It's based on the code in the [examples](https://github.com/joeldenning/single-spa-examples) repository.

## Ideology

The hope here is that "one SPA to rule them all" will help scale teams and organizations that have complex apps -- this is done by making it easier to split code and then deploy it independently. To explain why single SPA is advantageous, consider the following **disadvantages of a multiple SPA approach**:

1. Implementation details are usually reflected in the URL (different subdomains for different SPAs, or different apps own different prefixes in the window.location.pathname)
2. Each SPA tends to become a monolith, since it's easier to add to an existing SPA than it is to figure out how to deploy a new SPA.
3. Transitioning between the apps is a full page unload-then-load, which generally provides a worse user experience. It *is* possible to mitigate this one with server-side routing + rendering (popularly done with React), but single-spa offers an alternative approach.
4. Shared functionality can *only* be accomplished via shared libraries, instead of a service oriented architecture ("Update it and hope library consumers upgrade" vs "Deploy it once and now everyone has it")

## How to use it
In general, the process is to create a root app which imports single-spa and declares child applications by calling `singleSpa.declareChildApplication(...)`. Each child application starts out as just a single-spa.config.js file, with the rest of the app (the html document, the js, the css, etc) being lazy loaded later on. As the app is being loaded, mounted, unmounted, etc., lifecycle functions are called to allow customized behavior. SSPA plugins are written to standardize the lifecycle functions for popular technologies like angular, jspm, react, webpack, etc.

Example:
```javascript
// root-app.html
<html>
    <head>
        <script src="/jspm_packages/system.src.js"></script>
        <script src="/config.js"></script>
        <script>
            System.import('/root-app.js');
        </script>
    </head>
</html>

// root-app.js
import { declareChildApplication } from "single-spa";
declareChildApplication('/apps/myApp/single-spa.config.js', () => window.location.pathname.startsWith('/myApp'));

// apps/myApp/single-spa.config.js
export const publicRoot = '/apps/the-directory-my-app-is-in'; //the path on the web server to the directory the app is in.
export const pathToIndex = 'index.html'; //This is a relative url (based on publicRoot) to the html document that bootstraps your app
export const lifecycles = []; //put any plugins (i.e., for jspm or angular) here
```

### Configuring JSPM apps
[single-spa-jspm](https://github.com/joeldenning/single-spa-jspm) is an actively maintained project that eases the burden of configuring jspm apps. To use it, run the following in your root app's directory
`jspm install npm:single-spa-jspm`
and then add the following to the jspm app's single-spa.config.js:
```javascript
import { defaultJspmApp } from "single-spa-jspm";
export const lifecycles = [...(any other plugins)..., defaultJspmApp()]
```
Thus far it seems that it's best to put your JSPM lifecycles at the end of the array.
### Configuring Webpack apps
So far, webpack has not required any special configuration to work in an SSPA environment. It works out of the box! So no need to add a "lifecycle" for webpack in your single-spa.config.js file.

One thing to watch out for, though, is to make sure that any urls in your webpack config are relative urls. For example, use `publicPath: 'build/'` instead of `publicPath: '/build/'`
### Configuring React apps
[single-spa-react](https://github.com/joeldenning/single-spa-react) is an actively maintained project that eases the burden of configuring react apps. To use it, run the following in your root app's directory
`jspm install npm:single-spa-react`
and then add the following to your single-spa.config.js:
```javascript
import { defaultReactApp } from "single-spa-react";

export const publicRoot = '...';
export const pathToIndex = 'index.html';

const reactApp = defaultReactApp({
    rootElementGetter: function() {
        return document.querySelector('#root-react-element');
    },
    mountApp: function() {
        return ReactDOM.render(<MyApp/>, document.getElementById('root-react-element');
    },
    ReactDOMGetter: function() { //only needed if the ReactDOM object is not leaked as a global
        return window.app.ReactDOM; //or however you want to reference ReactDOM
    }
});
export const lifecycles = [reactApp, ...(any other plugins)...];
```
### Configuring Angular apps
[single-spa-angular1](https://github.com/joeldenning/single-spa-angular1) is an actively maintained project that eases the burden of configuring Angular apps. To use it, run the following in your root app's directory
`jspm install npm:single-spa-angular1`
and then add the following to your single-spa.config.js
```javascript
import { defaultAngular1App } from "single-spa-angular1";

export const publicRoot = '....'; //the path on the web server to the directory the app is in

const angular1App = defaultAngular1App({
    publicRoot: publicRoot,
    rootAngularModule: '[name of your root angular module]',
    rootElementGetter: () => document.querySelector('#app-root') //or some other way of getting the root element
});
export const lifecycles = [...(any other plugins)..., angular1App]
```
### Configuring apps that leak globals
[single-spa-globals](https://github.com/joeldenning/single-spa-globals) is an actively maintained project that eases the burden of configuring apps that leak globals. To use it, run the following in your root app's directory
`jspm install npm:single-spa-globals`
and then add the following to your single-spa.config.js
```javascript
import { appWithGlobals } from "single-spa-globals";
export const publicRoot = '....';
export const pathToIndex = 'index.html';
export const lifecycles = [...(any other plugins)..., appWithGlobals(['app1', 'globalVar1', 'anotherGlobal'])]
```
### Configuring React-Router apps
react-router apps require no more configuration than plain old react apps. See above for how to configure react apps.
### Read the examples
There is also an [examples repository](https://github.com/joeldenning/single-spa-examples) that shows several apps working great in a single-spa environment. The following files are a good place to start:
- [The index.html file](https://github.com/joeldenning/single-spa-examples/blob/master/index.html)
- [The root app](https://github.com/joeldenning/single-spa-examples/blob/master/bootstrap.js)
- [The children apps](https://github.com/joeldenning/single-spa-examples/tree/master/apps)

Also note that it requires that as of 11/1/15, the root app that loads all other apps must be written with JSPM.  The goal is to move away from that towards the [whatwg/loader standard](https://github.com/whatwg/loader), probably polyfilled with the [es6-module-loader](https://github.com/ModuleLoader/es6-module-loader).

## Things that are not supported
- Single Spa is the one who controls the `<base>` tag, which means that apps should not control it. single-spa-angular1 makes it possible for angular to still work (even with History API pretty urls!) without the angular app putting a `<base>` tag in the app's index.html.
