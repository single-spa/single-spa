# single-spa

Multiple applications all lazily loaded and mounted/unmounted in the same single page application (SPA). The apps can be deployed independently to your web server of choice, lazy-loaded onto the page independently, and nested.

## View the demo!
A [demo is live](http://single-spa.surge.sh) on surge.sh. Don't be turned off by the lack of styling -- I'll be fixing that soon.

## Ideology

The hope here is that "one SPA to rule them all" will help scale teams and organizations that have complex apps -- this is done by making it easier to split code and then deploy it independently. To explain why single SPA is advantageous, consider the following **disadvantages of a multiple SPA approach**:

1. Implementation details are usually reflected in the URL (different subdomains for different SPAs, or different apps own different prefixes in the window.location.pathname)
2. Each SPA tends to become a monolith, since it's easier to add to an existing SPA than it is to figure out how to deploy a new SPA.
3. Transitioning between the apps is a full page unload-then-load, which generally provides a worse user experience. It *is* possible to mitigate this one with server-side routing + rendering (popularly done with React), but single-spa offers an alternative approach.
4. Shared functionality can *only* be accomplished via shared libraries, instead of a service oriented architecture ("Update it and hope library consumers upgrade" vs "Deploy it once and now everyone has it")

## How to use it
So right now it's still pretty alpha and so the best thing to do is look at the [examples repository](https://github.com/joeldenning/single-spa-examples). Especially the following files:
- [The index.html file](https://github.com/joeldenning/single-spa-examples/blob/master/index.html)
- [The root app](https://github.com/joeldenning/single-spa-examples/blob/master/bootstrap.js)
- [The children apps](https://github.com/joeldenning/single-spa-examples/tree/master/apps)

Also note that it requires that as of 10/8/15, the root app that loads all other apps must be written with JSPM.  The goal is to move away from that towards the [whatwg/loader standard](https://github.com/whatwg/loader) or maybe towards no loader standard at all (which would offload all of the loading work to the user).

