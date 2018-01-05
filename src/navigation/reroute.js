import CustomEvent from 'custom-event';
import { isStarted } from 'src/start.js';
import { toLoadPromise } from 'src/applications/lifecycles/load.js';
import { toBootstrapPromise } from 'src/applications/lifecycles/bootstrap.js';
import { toMountPromise } from 'src/applications/lifecycles/mount.js';
import { toUnmountPromise } from 'src/applications/lifecycles/unmount.js';
import { getMountedApps, getAppsToLoad, getAppsToUnmount, getAppsToMount } from 'src/applications/apps.js';
import { notSkipped } from 'src/applications/app.helpers.js';
import { callCapturedEventListeners } from './navigation-events.js';
import { getAppsToUnload, toUnloadPromise } from 'src/applications/lifecycles/unload.js';

let appChangeUnderway = false, peopleWaitingOnAppChange = [];

export function reroute(pendingPromises = [], eventArguments) {
  if (appChangeUnderway) {
    return new Promise((resolve, reject) => {
      peopleWaitingOnAppChange.push({
        resolve,
        reject,
        eventArguments,
      });
    });
  }

  appChangeUnderway = true;
  let wasNoOp = true;

  if (isStarted()) {
    return performAppChanges();
  } else {
    return loadApps();
  }

  async function loadApps() {
    const loadPromises = getAppsToLoad().map(toLoadPromise);

    if (loadPromises.length > 0) {
      wasNoOp = false;
    }

    try {
      await Promise.all(loadPromises);
    } catch(err) {
      callAllEventListeners();
      throw err;
    }

    return finishUpAndReturn();
  }

  async function performAppChanges() {

    let myCE
    if (eventArguments && eventArguments[0]) {
      myCE = {
        detail: eventArguments[0]
      }
    }
    window.dispatchEvent(new CustomEvent("single-spa:before-routing-event", myCE));
    const unloadPromises = getAppsToUnload().map(toUnloadPromise);

    const unmountUnloadPromises = getAppsToUnmount()
      .map(toUnmountPromise)
      .map(unmountPromise => unmountPromise.then(toUnloadPromise));

    const allUnmountPromises = unmountUnloadPromises.concat(unloadPromises);
    if (allUnmountPromises.length > 0) {
      wasNoOp = false;
    }

    const unmountAllPromise = Promise.all(allUnmountPromises);

    const appsToLoad = getAppsToLoad();

    /* We load and bootstrap apps while other apps are unmounting, but we
     * wait to mount the app until all apps are finishing unmounting
     */
    const loadThenMountPromises = appsToLoad.map(app => {
      return toLoadPromise(app)
        .then(toBootstrapPromise)
        .then(async function(app) {
          await unmountAllPromise;
          return toMountPromise(app);
        })
    })
    if (loadThenMountPromises.length > 0) {
      wasNoOp = false;
    }

    /* These are the apps that are already bootstrapped and just need
     * to be mounted. They each wait for all unmounting apps to finish up
     * before they mount.
     */
    const mountPromises = getAppsToMount()
      .filter(appToMount => appsToLoad.indexOf(appToMount) < 0)
      .map(async function(appToMount) {
        await toBootstrapPromise(appToMount);
        await unmountAllPromise;
        return toMountPromise(appToMount);
      })
    if (mountPromises.length > 0) {
      wasNoOp = false;
    }

    try {
      await unmountAllPromise;
    } catch(err) {
      callAllEventListeners();
      throw err;
    }

    /* Now that the apps that needed to be unmounted are unmounted, their DOM navigation
     * events (like hashchange or popstate) should have been cleaned up. So it's safe
     * to let the remaining captured event listeners to handle about the DOM event.
     */
    callAllEventListeners();

    try {
      await Promise.all(loadThenMountPromises.concat(mountPromises));
    } catch(err) {
      pendingPromises.forEach(promise => promise.reject(err));
      throw err;
    }

    return finishUpAndReturn(false);
  }

  function finishUpAndReturn(callEventListeners=true) {
    const returnValue = getMountedApps();

    if (callEventListeners) {
      callAllEventListeners();
    }
    pendingPromises.forEach(promise => promise.resolve(returnValue));

    try {
      const appChangeEventName = wasNoOp ? "single-spa:no-app-change": "single-spa:app-change";
      window.dispatchEvent(new CustomEvent(appChangeEventName));
      window.dispatchEvent(new CustomEvent("single-spa:routing-event"));
    } catch (err) {
      /* We use a setTimeout because if someone else's event handler throws an error, single-spa
       * needs to carry on. If a listener to the event throws an error, it's their own fault, not
       * single-spa's.
       */
      setTimeout(() => {
        throw err;
      });
    }

    /* Setting this allows for subsequent calls to reroute() to actually perform
     * a reroute instead of just getting queued behind the current reroute call.
     * We want to do this after the mounting/unmounting is done but before we
     * resolve the promise for the `reroute` async function.
     */
    appChangeUnderway = false;

    if (peopleWaitingOnAppChange.length > 0) {
      /* While we were rerouting, someone else triggered another reroute that got queued.
       * So we need reroute again.
       */
      const nextPendingPromises = peopleWaitingOnAppChange;
      peopleWaitingOnAppChange = [];
      reroute(nextPendingPromises);
    }

    return returnValue;
  }

  /* We need to call all event listeners that have been delayed because they were
   * waiting on single-spa. This includes haschange and popstate events for both
   * the current run of performAppChanges(), but also all of the queued event listeners.
   * We want to call the listeners in the same order as if they had not been delayed by
   * single-spa, which means queued ones first and then the most recent one.
   */
  function callAllEventListeners() {
    pendingPromises.forEach(pendingPromise => {
      callCapturedEventListeners(pendingPromise.eventArguments);
    });

    callCapturedEventListeners(eventArguments);
  }
}
