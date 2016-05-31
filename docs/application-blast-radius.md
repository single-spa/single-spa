# Child application blast radius

single-spa provides two layers of defense against one child application causing problems
for the entire root application:

1. **ES Modules:** Since single-spa's api requires the use of modules that expose an API, a
   lot of the traditional scoping problems (global by default, shared mutable objects, 
   communication through DOM Element attributes instead of Javascript) are greatly reduced.
1. **Siloing errored child applications:** When a child application is unable to recover
   from an error that occurs during a lifecycle function, single-spa will silo that application
   such that it no longer will be mounted / unmounted, etc. Instead, it will remain in a dormant
   state so that other child applications can continue on.
