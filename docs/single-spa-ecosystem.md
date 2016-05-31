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

## Help with webpack
Webpack is awesome for bundling. Unfortunately, it's not a full-blown
[loader](https://whatwg.github.io/loader/) and therefore you'll have
to bring in either SystemJS or another loader. If you choose SystemJS,
try out the [webpack-system-register](https://github.com/CanopyTax/webpack-system-register)
plugin which will wrap your webpack bundle into a format that SystemJS
can fully communicate with.

Alternatively, if you find a way to get things working with just a `require.ensure`
or with webpack 2's `System.import` support, definitely let us know!
