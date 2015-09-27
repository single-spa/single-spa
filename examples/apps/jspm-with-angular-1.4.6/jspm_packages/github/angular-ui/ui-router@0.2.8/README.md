# AngularUI Router &nbsp;[![Build Status](https://travis-ci.org/angular-ui/ui-router.png?branch=master)](https://travis-ci.org/angular-ui/ui-router)

#### The de-facto solution to flexible routing with nested views
---
**[Download 0.2.8](http://angular-ui.github.io/ui-router/release/angular-ui-router.js)** (or **[Minified](http://angular-ui.github.io/ui-router/release/angular-ui-router.min.js)**) **|**
**[Learn](#resources) |**
**[Discuss](https://groups.google.com/forum/#!categories/angular-ui/router) |**
**[Get Help](http://stackoverflow.com/questions/ask?tags=angularjs,angular-ui-router) |**
**[Report an Issue](#report-an-issue) |**
**[Contribute](#contribute)**

---

AngularUI Router is a routing framework for [AngularJS](http://angularjs.org), which allows you to organize the
parts of your interface into a [*state machine*](https://en.wikipedia.org/wiki/Finite-state_machine). Unlike the
[`$route` service](http://docs.angularjs.org/api/ngRoute.$route) in Angular core, which is organized around URL
routes, UI-Router is organized around [*states*](https://github.com/angular-ui/ui-router/blob/master/sample/states.js#L28-L269),
which may optionally have routes, as well as other behavior, attached.

States are bound to *named*, *nested* and *parallel views*, allowing you to powerfully manage your application's interface.

-
**Warning:** *UI-Router is pre-beta and under active development. As such, while this library is well-tested, the API is subject
to change. Using it in a project that requires guaranteed stability is not recommended.*


## Get Started

**(1)** Get UI-Router in one of 4 ways:
 - clone & [build](#developing) this repository
 - [download the release](http://angular-ui.github.io/ui-router/release/angular-ui-router.js) (or [minified](http://angular-ui.github.io/ui-router/release/angular-ui-router.min.js))
 - via **[Bower](http://bower.io/)**: by running `$ bower install angular-ui-router` from your console
 - or via **[Component](https://github.com/component/component)**: by running `$ component install angular-ui/ui-router` from your console

**(2)** Include `angular-ui-router.js` (or `angular-ui-router.min.js`) in your `index.html`, after including Angular itself (For Component users: ignore this step)

**(3)** Add `'ui.router'` to your main module's list of dependencies (For Component users: replace `'ui.router'` with `require('angular-ui-router')`)

When you're done, your setup should look similar to the following:

>
```html
<!doctype html>
<html ng-app="myApp">
<head>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>
    <script src="js/angular-ui-router.min.js"></script>
    <script>
        var myApp = angular.module('myApp', ['ui.router']);
        // For Component users, it should look like this:
        // var myApp = angular.module('myApp', [require('angular-ui-router')]);
    </script>
    ...
</head>
<body>
    ...
</body>
</html>
```

### Nested States & Views

The majority of UI-Router's power is in its ability to nest states & views.

**(1)** First, follow the [setup](#get-started) instructions detailed above.

**(2)** Then, add a [`ui-view` directive](https://github.com/angular-ui/ui-router/wiki/Quick-Reference#ui-view) to the `<body />` of your app.

>
```html
<!-- index.html -->
<body>
    <div ui-view></div>
    <!-- We'll also add some navigation: -->
    <a ui-sref="state1">State 1</a>
    <a ui-sref="state2">State 2</a>
</body>
```

**(3)** You'll notice we also added some links with [`ui-sref` directives](https://github.com/angular-ui/ui-router/wiki/Quick-Reference#ui-sref). In addition to managing state transitions, this directive auto-generates the `href` attribute of the `<a />` element it's attached to, if the corresponding state has a URL. Next we'll add some templates. These will plug into the `ui-view` within `index.html`. Notice that they have their own `ui-view` as well! That is the key to nesting states and views.

>
```html
<!-- partials/state1.html -->
<h1>State 1</h1>
<hr/>
<a ui-sref="state1.list">Show List</a>
<div ui-view></div>
```
```html
<!-- partials/state2.html -->
<h1>State 2</h1>
<hr/>
<a ui-sref="state2.list">Show List</a>
<div ui-view></div>
```

**(4)** Next, we'll add some child templates. *These* will get plugged into the `ui-view` of their parent state templates.

>
```html
<!-- partials/state1.list.html -->
<h3>List of State 1 Items</h3>
<ul>
  <li ng-repeat="item in items">{{ item }}</li>
</ul>
```

>
```html
<!-- partials/state2.list.html -->
<h3>List of State 2 Things</h3>
<ul>
  <li ng-repeat="thing in things">{{ thing }}</li>
</ul>
```

**(5)** Finally, we'll wire it all up with `$stateProvider`. Set up your states in the module config, as in the following:


>
```javascript
myApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/state1");
  //
  // Now set up the states
  $stateProvider
    .state('state1', {
      url: "/state1",
      templateUrl: "partials/state1.html"
    })
    .state('state1.list', {
      url: "/list",
      templateUrl: "partials/state1.list.html",
      controller: function($scope) {
        $scope.items = ["A", "List", "Of", "Items"];
      }
    })
    .state('state2', {
      url: "/state2",
      templateUrl: "partials/state2.html"
    })
    .state('state2.list', {
      url: "/list",
        templateUrl: "partials/state2.list.html",
        controller: function($scope) {
          $scope.things = ["A", "Set", "Of", "Things"];
        }
      })
    });
```

**(6)** See this quick start example in action.
>**[Go to Quick Start Plunker for Nested States & Views](http://plnkr.co/edit/u18KQc?p=preview)**

**(7)** This only scratches the surface
>**[Dive Deeper!](https://github.com/angular-ui/ui-router/wiki)**


### Multiple & Named Views

Another great feature is the ability to have multiple `ui-view`s view per template.

**Pro Tip:** *While multiple parallel views are a powerful feature, you'll often be able to manage your
interfaces more effectively by nesting your views, and pairing those views with nested states.*

**(1)** Follow the [setup](#get-started) instructions detailed above.

**(2)** Add one or more `ui-view` to your app, give them names.
>
```html
<!-- index.html -->
<body>
    <div ui-view="viewA"></div>
    <div ui-view="viewB"></div>
    <!-- Also a way to navigate -->
    <a ui-sref="route1">Route 1</a>
    <a ui-sref="route2">Route 2</a>
</body>
```

**(3)** Set up your states in the module config:
>
```javascript
myApp.config(function($stateProvider) {
  $stateProvider
    .state('index', {
      url: "",
      views: {
        "viewA": { template: "index.viewA" },
        "viewB": { template: "index.viewB" }
      }
    })
    .state('route1', {
      url: "/route1",
      views: {
        "viewA": { template: "route1.viewA" },
        "viewB": { template: "route1.viewB" }
      }
    })
    .state('route2', {
      url: "/route2",
      views: {
        "viewA": { template: "route2.viewA" },
        "viewB": { template: "route2.viewB" }
      }
    })
});
```

**(4)** See this quick start example in action.
>**[Go to Quick Start Plunker for Multiple & Named Views](http://plnkr.co/edit/SDOcGS?p=preview)**


## Resources

* [In-Depth Guide](https://github.com/angular-ui/ui-router/wiki)
* [API Quick Reference](https://github.com/angular-ui/ui-router/wiki/Quick-Reference)
* [Sample App](http://angular-ui.github.com/ui-router/sample/) ([Source](https://github.com/angular-ui/ui-router/tree/master/sample))
* [FAQ](https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions)
* [Introduction Video](http://egghead.io/lessons/angularjs-introduction-ui-router)
* [Slides from CincyNg Meetup](http://slid.es/timkindberg/ui-router#/)

## Report an Issue

Help us make UI-Router better! If you think you might have found a bug, or some other weirdness, start by making sure
it hasn't already been reported. You can [search through existing issues](https://github.com/angular-ui/ui-router/search?q=wat%3F&type=Issues)
to see if someone's reported one similar to yours.

If not, then [create a plunkr](http://plnkr.co/edit/u18KQc?p=preview) that demonstrates the problem (try to use as little code
as possible: the more minimalist, the faster we can debug it).

Next, [create a new issue](https://github.com/angular-ui/ui-router/issues/new) that briefly explains the problem,
and provides a bit of background as to the circumstances that triggered it. Don't forget to include the link to
that plunkr you created!

**Note**: If you're unsure how a feature is used, or are encountering some unexpected behavior that you aren't sure
is a bug, it's best to talk it out in the
[Google Group](https://groups.google.com/forum/#!categories/angular-ui/router) or on
[StackOverflow](http://stackoverflow.com/questions/ask?tags=angularjs,angular-ui-router) before reporting it. This
keeps development streamlined, and helps us focus on building great software.

Please keep in mind that the issue tracker is for *issues*. Please do *not* post an issue if you need help or support. Instead, see one of the above-mentioned forums or [IRC](irc://irc.freenode.net/#angularjs).


## Contribute

**(1)** See the **[Developing](#developing)** section below, to get the development version of UI-Router up and running on your local machine.

**(2)** Check out the [roadmap](https://github.com/angular-ui/ui-router/issues/milestones) to see where the project is headed, and if your feature idea fits with where we're headed.

**(3)** If you're not sure, [open an RFC](https://github.com/angular-ui/ui-router/issues/new?title=RFC:%20My%20idea) to get some feedback on your idea.

**(4)** Finally, commit some code and open a pull request. Code & commits should abide by the following rules:

- *Always* have test coverage for new features (or regression tests for bug fixes), and *never* break existing tests
- Commits should represent one logical change each; if a feature goes through multiple iterations, squash your commits down to one
- Make sure to follow the [Angular commit message format](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format) so your change will appear in the changelog of the next release.
- Changes should always respect the coding style of the project



## Developing

UI-Router uses <code>grunt >= 0.4.x</code>. Make sure to upgrade your environment and read the
[Migration Guide](http://gruntjs.com/upgrading-from-0.3-to-0.4).

Dependencies for building from source and running tests:

* [grunt-cli](https://github.com/gruntjs/grunt-cli) - run: `$ npm install -g grunt-cli`
* Then, install the development dependencies by running `$ npm install` from the project directory

There are a number of targets in the gruntfile that are used to generating different builds:

* `grunt`: Perform a normal build, runs jshint and karma tests
* `grunt build`: Perform a normal build
* `grunt dist`: Perform a clean build and generate documentation
* `grunt dev`: Run dev server (sample app) and watch for changes, builds and runs karma tests on changes.
