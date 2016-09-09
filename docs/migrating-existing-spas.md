# Migrating existing SPAs

If you're interested in migrating existing SPAs into a single-spa, you'll
need to do three things:
1. Create a [root application](/docs/root-application.md)
1. [Convert your SPA or SPAs to be child applications](#converting-spas-into-child-applications)
1. Adjust your html file so that your root application is the new boss in town.
   See [docs](/docs/root-application#indexhtml-file)

## Converting SPAs into child applications
Your existing SPAs, whether they be Angular, React, or something else, probably are
not used to unmounting themselves from the DOM. Also, they probably have had the luxury
of controlling the entire html page themselves, instead of being purely javascript applications
that don't have sole control over `<script>` tags and `<link>` tags. So in order to convert them
into single-spa child applications, they will need to overcome those obstacles while implementing
lifecycle functions.

### (1) Implementing lifecycle functions
See [the child application lifecycle docs](/docs/child-applications.md) to see what you need to do.
The hardest part will almost certainly be the `unmount` lifecycle, since most SPAs aren't accustomed
to going dormant and being unmounted. When implementing your lifecycle functions, first check out the [ecosystem](/docs/single-spa-ecosystem.md)
docs before reinventing the wheel yourself. After that, you'll have to make sure that your
SPA can clean up its DOM, DOM event listeners (all of them, but *especially* hashchange and popstate),
and memory.

### (2) Getting the CSS, fonts, <script> dependencies to work
Since existing SPAs are used to having an index.html file for their css, fonts,
third party script-tags, etc., it's likely that you'll have to do some work
to make sure all of those keep on working when your SPA becomes an html-less [child
application](/docs/child-applications.md). It is best to try to put all that
you can into the javascript bundle, but your escape hatch is to put the things
you need into your [root application](/docs/root-application.md).
