# Separating out applications

In a large, microserviced system, your root single-spa configuration and each of the applications
should probably have its own git repository. How to do that in a javascript project isn't necessarily clear,
so some options are listed below.

Since single-spa is a framework that helps with organizational scaling, it is
important to figure out how to split out and separate applications from each other
so that developers and teams can work on the applications without stepping on each others' toes.

Most interpretations of microservice architecture encourage separate code repositories, builds, and
deployments. Although **single-spa does not solve how code is hosted, built, or deployed**,
these are relevant to many users of single-spa, so some strategies for doing so are discussed here.

#### Option 1: One code repo, one build

The simplest approach for using single-spa is to have one code repository with everything in it.
Typically, you would have a single package.json with a single webpack config that produces a bundle
that can be included in an html file with a `<script>` tag.

Advantages:
- Simplest to set up
- [monolithic version control has some advantages](https://danluu.com/monorepo/)

Disadvantages:
- One master webpack config and package.json means less flexibility / freedom for individual projects
- Slow build times once your project gets large
- Builds and deployments are all tied together, which can necessitate fixed release schedules instead of ad hoc releases.

#### Option 2: NPM packages

Create a root application that npm installs each of the single-spa applications. Each child application
is in a separate code repository and is responsible for publishing a new version everytime that it updates.
The root application should reinstall, rebuild, and redeploy whenever a single-spa application changes.

Typically, the single-spa applications compile themselves separately with babel and/or webpack.

Note that you can also use the [monorepo methodology](https://medium.com/netscape/the-case-for-monorepos-907c1361708a) which
allows for separate builds without having separate code repositories.

Advantages:
- npm install is familiar and easy to set up
- Separate npm packages means each application can build itself separately before publishing to npm

Disadvantages:
- The root application must reinstall the child applications in order to rebuild/redeploy
- Medium difficulty to set up

#### Option 3: Dynamic Module Loading

Create a root application which can allow single-spa applications to deploy themselves separately. To do so,
create a manifest file that the single-spa applications update during their deployment process, which controls
which versions of the single-spa applications are "live". Then change which javascript file is loaded based on the manifest.

Changing which javascript file is loaded for each child application can be done in many ways.
1) Web server: have your webserver create a dynamic script tag for the "live" version of each single-spa application.
2) Use a [module loader](https://www.jvandemo.com/a-10-minute-primer-to-javascript-modules-module-formats-module-loaders-and-module-bundlers/)
   such as [SystemJS](https://github.com/systemjs/systemjs) that can download and execute javascript code in the browser
   from dynamic urls.

#### Comparison
|                | Separate code repositories | Separate builds | Separate deployments | Difficulty to set up | Example repo |
| -------------- | -------------------------- | --------------- | -------------------- | -------------------- | ------------ |
| One code repo  |                            |                 |                      |        Easy          | [simple-webpack-example](https://github.com/joeldenning/simple-single-spa-webpack-example) and [single-spa-examples](https://github.com/CanopyTax/single-spa-examples) |
| NPM modules    |            [x]             |       [x]       |                      |       Medium         | (No example repo, yet -- contributions accepted!) |
| Module loading |            [x]             |       [x]       |          [x]         |        Hard          | [single-spa-portal-example](https://github.com/me-12/single-spa-portal-example) |
