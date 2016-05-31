# Migrating existing SPAs

If you're interested in migrating existing SPAs into a single-spa world, you'll
probably encounter two main barriers:

## (1) Using a loader instead of just a bundler
The build system that you use to create your javascript most likely doesn't
have [loaders](https://whatwg.github.io/loader/) in a central role. If you're
using webpack, there are some resources in the [ecosystem wiki](/docs/single-spa-ecosystem.md).
If you're using browserify, requirejs, gulp, grunt, etc, the challenge that
you'll need to conquer is that you need your built files to export lifecycle
functions that the loader of your choice can understand. The good news
is that if you're using SystemJS, it supports all major module formats,
including amd, esm, cjs, umd, and globals. If you make anything cool to help
make building things easier, definitely let us know and we will link to your
project in our wikis.

## (2) Non-javascript assets
Since existing SPAs are used to having an index.html file for their css, fonts,
third party script-tags, etc., it's likely that you'll have to do some work
to make sure all of those keep on working when your SPA becomes an html-less [child
application](/docs/child-applications.md). It is best to try to put all that
you can into the javascript bundle, but your escape hatch is to put the things
you need into your [root application](/docs/root-application.md).
