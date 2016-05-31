# Root application
The single-spa root application consists of all code that is not part of a
[child application ("chapp")](/docs/child-applications.md). Ideally, this only includes an html file
and a javascript file that declares single-spa child applications. It is best practice to keep your
root application as small as possible and to simply defer to single-spa to manage
all of the child applications. The root application should not be doing client-side html
rendering nor should it be responding to routing events such as `hashchange` or `popstate`.
Instead, all of that functionality should be taken care of either by single-spa itself or by
a child application.

## Index.html file
Feel free to do whatever you want in your index.html file, but add in a couple of single-spa
specific things in there:

1. Make sure your loader is recognized by single-spa. If the loader is found at `window.System` or `window.SystemJS`,
   then single-spa will automatically detect it. Otherwise, use the [`setLoader`](/docs/single-spa-api.md#setloader) api.
1. Import your single-spa root application.

## Declaring child applications

Declaring a [child application](/docs/child-applications.md) is registering it with single-spa so that it will be loaded,
initialized, mounted, and unmounted at the right times. Declaration most commonly occurs inside of the root application, but
does not have to. Note that if a child application is declared from within another child application, that no hierarchy
will be maintained between the child applications. Instead, the child applications will be siblings and will be mounted
and unmounted according to their own activity functions.

In order to declare a child application, call the `declareChildApplication(path, activityFunction)` api. Example:

```js
import { declareChildApplication } from 'single-spa';

declareChildApplication("src/app1/app1.main.js", function() {
	return window.location.hash.indexOf("#/app1/") === 0;
});
declareChildApplication("src/app2/app2.main.js", function() {
	return window.location.hash.indexOf("#/app2/") === 0;
});
```

### Path to child application
The first argument to `declareChildApplication` must be a string that your loader (such as SystemJS) can import.

### Activity function
The second argument to `declareChildApplication` must be a function that takes in no arguments and returns a truthy
value whenever the child application should be active. Most commonly, the activity function determines if a chapp
is active by looking at `window.location`. When this is done, single-spa as a whole is acting as a high-level router
that is framework agnostic.

single-spa will call each child application's activity function under the following scenarios:
- `hashchange` or `popstate` event
- `pushState` or `replaceState` is called
- [`triggerAppChange`](/docs/single-spa-api.md#triggerappchange) api is called on single-spa

## Two chapps simultaneously??
Yep, it's possible. And it's actually not that scary if you do it right. And once you do,
it's really really powerful. One approach to do it is to designate one `<div id="main-content">` for the main
content and then have other divs for navbars, menus, etc. Then choose to have
only one main content application chapp at a time, but many navbar/menu chapps active
simultaneously. Content applications would put their html into `#main-content`, and then clear out all DOM elements
from that div when unmounting.
