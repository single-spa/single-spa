import CustomEvent from "custom-event";
import { isStarted } from "../start.js";
import { toLoadPromise } from "../lifecycles/load.js";
import { toBootstrapPromise } from "../lifecycles/bootstrap.js";
import { toMountPromise } from "../lifecycles/mount.js";
import { toUnmountPromise } from "../lifecycles/unmount.js";
import {
  getAppStatus,
  getAppChanges,
  getMountedApps,
} from "../applications/apps.js";
import {
  callCapturedEventListeners,
  originalReplaceState,
} from "./navigation-events.js";
import { toUnloadPromise } from "../lifecycles/unload.js";
import {
  toName,
  shouldBeActive,
  NOT_MOUNTED,
  MOUNTED,
  NOT_LOADED,
  SKIP_BECAUSE_BROKEN,
} from "../applications/app.helpers.js";
import { assign } from "../utils/assign.js";
import { isInBrowser } from "../utils/runtime-environment.js";
import { formatErrorMessage } from "../applications/app-errors.js";
import { addProfileEntry } from "../devtools/profiler.js";

let appChangeUnderway = false,
  peopleWaitingOnAppChange = [],
  currentUrl = isInBrowser && window.location.href;

export function triggerAppChange() {
  // Call reroute with no arguments, intentionally
  return reroute();
}

export function reroute(
  pendingPromises = [],
  eventArguments,
  silentNavigation = false
) {
  if (appChangeUnderway) {
    return new Promise((resolve, reject) => {
      peopleWaitingOnAppChange.push({
        resolve,
        reject,
        eventArguments,
      });
    });
  }

  let startTime, profilerKind;

  if (__PROFILE__) {
    startTime = performance.now();
    if (silentNavigation) {
      profilerKind = "silentNavigation";
    } else if (eventArguments) {
      profilerKind = "browserNavigation";
    } else {
      profilerKind = "triggerAppChange";
    }
  }

  const { appsToUnload, appsToUnmount, appsToLoad, appsToMount } =
    getAppChanges();
  let appsThatChanged,
    cancelPromises = [],
    oldUrl = currentUrl,
    newUrl = (currentUrl = window.location.href);

  if (isStarted()) {
    appChangeUnderway = true;
    appsThatChanged = appsToUnload.concat(
      appsToLoad,
      appsToUnmount,
      appsToMount
    );
    return performAppChanges();
  } else {
    appsThatChanged = appsToLoad;
    return loadApps();
  }

  function cancelNavigation(val = true) {
    const promise =
      typeof val?.then === "function" ? val : Promise.resolve(val);
    cancelPromises.push(
      promise.catch((err) => {
        console.warn(
          Error(
            formatErrorMessage(
              42,
              __DEV__ &&
                `single-spa: A cancelNavigation promise rejected with the following value: ${err}`
            )
          )
        );
        console.warn(err);

        // Interpret a Promise rejection to mean that the navigation should not be canceled
        return false;
      })
    );
  }

  function loadApps() {
    return Promise.resolve().then(() => {
      const loadPromises = appsToLoad.map(toLoadPromise);
      let succeeded;

      return (
        Promise.all(loadPromises)
          .then(callAllEventListeners)
          // there are no mounted apps, before start() is called, so we always return []
          .then(() => {
            if (__PROFILE__) {
              succeeded = true;
            }

            return [];
          })
          .catch((err) => {
            if (__PROFILE__) {
              succeeded = false;
            }

            callAllEventListeners();
            throw err;
          })
          .finally(() => {
            if (__PROFILE__) {
              addProfileEntry(
                "routing",
                "loadApps",
                profilerKind,
                startTime,
                performance.now(),
                succeeded
              );
            }
          })
      );
    });
  }

  function performAppChanges() {
    return Promise.resolve().then(() => {
      // https://github.com/single-spa/single-spa/issues/545
      fireSingleSpaEvent(
        appsThatChanged.length === 0
          ? "before-no-app-change"
          : "before-app-change",
        getCustomEventDetail(true)
      );

      fireSingleSpaEvent(
        "before-routing-event",
        getCustomEventDetail(true, { cancelNavigation })
      );

      return Promise.all(cancelPromises).then((cancelValues) => {
        const navigationIsCanceled = cancelValues.some((v) => v);

        if (navigationIsCanceled) {
          // Change url back to old url, without triggering the normal single-spa reroute
          originalReplaceState.call(
            window.history,
            history.state,
            "",
            oldUrl.substring(location.origin.length)
          );

          // Single-spa's internal tracking of current url needs to be updated after the url change above
          currentUrl = location.href;

          // necessary for the reroute function to know that the current reroute is finished
          appChangeUnderway = false;

          if (__PROFILE__) {
            addProfileEntry(
              "routing",
              "navigationCanceled",
              profilerKind,
              startTime,
              performance.now(),
              true
            );
          }

          // Tell single-spa to reroute again, this time with the url set to the old URL
          return reroute(pendingPromises, eventArguments, true);
        }

        const unloadPromises = appsToUnload.map(toUnloadPromise);

        const unmountUnloadPromises = appsToUnmount
          .map(toUnmountPromise)
          .map((unmountPromise) => unmountPromise.then(toUnloadPromise));

        const allUnmountPromises = unmountUnloadPromises.concat(unloadPromises);

        const unmountAllPromise = Promise.all(allUnmountPromises);

        let unmountFinishedTime;

        unmountAllPromise.then(
          () => {
            if (__PROFILE__) {
              unmountFinishedTime = performance.now();

              addProfileEntry(
                "routing",
                "unmountAndUnload",
                profilerKind,
                startTime,
                performance.now(),
                true
              );
            }
            fireSingleSpaEvent(
              "before-mount-routing-event",
              getCustomEventDetail(true)
            );
          },
          (err) => {
            if (__PROFILE__) {
              addProfileEntry(
                "routing",
                "unmountAndUnload",
                profilerKind,
                startTime,
                performance.now(),
                true
              );
            }

            throw err;
          }
        );

        /* We load and bootstrap apps while other apps are unmounting, but we
         * wait to mount the app until all apps are finishing unmounting
         */
        const loadThenMountPromises = appsToLoad.map((app) => {
          return toLoadPromise(app).then((app) =>
            tryToBootstrapAndMount(app, unmountAllPromise)
          );
        });

        /* These are the apps that are already bootstrapped and just need
         * to be mounted. They each wait for all unmounting apps to finish up
         * before they mount.
         */
        const mountPromises = appsToMount
          .filter((appToMount) => appsToLoad.indexOf(appToMount) < 0)
          .map((appToMount) => {
            return tryToBootstrapAndMount(appToMount, unmountAllPromise);
          });
        return unmountAllPromise
          .catch((err) => {
            callAllEventListeners();
            throw err;
          })
          .then(() => {
            /* Now that the apps that needed to be unmounted are unmounted, their DOM navigation
             * events (like hashchange or popstate) should have been cleaned up. So it's safe
             * to let the remaining captured event listeners to handle about the DOM event.
             */
            callAllEventListeners();

            return Promise.all(loadThenMountPromises.concat(mountPromises))
              .catch((err) => {
                pendingPromises.forEach((promise) => promise.reject(err));
                throw err;
              })
              .then(finishUpAndReturn)
              .then(
                () => {
                  if (__PROFILE__) {
                    addProfileEntry(
                      "routing",
                      "loadAndMount",
                      profilerKind,
                      unmountFinishedTime,
                      performance.now(),
                      true
                    );
                  }
                },
                (err) => {
                  if (__PROFILE__) {
                    addProfileEntry(
                      "routing",
                      "loadAndMount",
                      profilerKind,
                      unmountFinishedTime,
                      performance.now(),
                      false
                    );
                  }

                  throw err;
                }
              );
          });
      });
    });
  }

  function finishUpAndReturn() {
    const returnValue = getMountedApps();
    pendingPromises.forEach((promise) => promise.resolve(returnValue));

    try {
      const appChangeEventName =
        appsThatChanged.length === 0 ? "no-app-change" : "app-change";
      fireSingleSpaEvent(appChangeEventName, getCustomEventDetail());
      fireSingleSpaEvent("routing-event", getCustomEventDetail());
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
     * resolve the promise for the `reroute` function.
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
    // During silent navigation (when navigation was canceled and we're going back to the old URL),
    // we should not fire any popstate / hashchange events
    if (!silentNavigation) {
      pendingPromises.forEach((pendingPromise) => {
        callCapturedEventListeners(pendingPromise.eventArguments);
      });

      callCapturedEventListeners(eventArguments);
    }
  }

  function getCustomEventDetail(isBeforeChanges = false, extraProperties) {
    const newAppStatuses = {};
    const appsByNewStatus = {
      // for apps that were mounted
      [MOUNTED]: [],
      // for apps that were unmounted
      [NOT_MOUNTED]: [],
      // apps that were forcibly unloaded
      [NOT_LOADED]: [],
      // apps that attempted to do something but are broken now
      [SKIP_BECAUSE_BROKEN]: [],
    };

    if (isBeforeChanges) {
      appsToLoad.concat(appsToMount).forEach((app, index) => {
        addApp(app, MOUNTED);
      });
      appsToUnload.forEach((app) => {
        addApp(app, NOT_LOADED);
      });
      appsToUnmount.forEach((app) => {
        addApp(app, NOT_MOUNTED);
      });
    } else {
      appsThatChanged.forEach((app) => {
        addApp(app);
      });
    }

    const result = {
      detail: {
        newAppStatuses,
        appsByNewStatus,
        totalAppChanges: appsThatChanged.length,
        originalEvent: eventArguments?.[0],
        oldUrl,
        newUrl,
      },
    };

    if (extraProperties) {
      assign(result.detail, extraProperties);
    }

    return result;

    function addApp(app, status) {
      const appName = toName(app);
      status = status || getAppStatus(appName);
      newAppStatuses[appName] = status;
      const statusArr = (appsByNewStatus[status] =
        appsByNewStatus[status] || []);
      statusArr.push(appName);
    }
  }

  function fireSingleSpaEvent(name, eventProperties) {
    // During silent navigation (caused by navigation cancelation), we should not
    // fire any single-spa events
    if (!silentNavigation) {
      window.dispatchEvent(
        new CustomEvent(`single-spa:${name}`, eventProperties)
      );
    }
  }
}

/**
 * Let's imagine that some kind of delay occurred during application loading.
 * The user without waiting for the application to load switched to another route,
 * this means that we shouldn't bootstrap and mount that application, thus we check
 * twice if that application should be active before bootstrapping and mounting.
 * https://github.com/single-spa/single-spa/issues/524
 */
function tryToBootstrapAndMount(app, unmountAllPromise) {
  if (shouldBeActive(app)) {
    return toBootstrapPromise(app).then((app) =>
      unmountAllPromise.then(() =>
        shouldBeActive(app) ? toMountPromise(app) : app
      )
    );
  } else {
    return unmountAllPromise.then(() => app);
  }
}
