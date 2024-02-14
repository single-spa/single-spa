import {
  NOT_MOUNTED,
  UNLOADING,
  NOT_LOADED,
  LOAD_ERROR,
  SKIP_BECAUSE_BROKEN,
  toName,
} from "../applications/app.helpers";
import { handleAppError } from "../applications/app-errors";
import { reasonableTime } from "../applications/timeouts";
import { addProfileEntry } from "../devtools/profiler";

const appsToUnload = {};

export function toUnloadPromise(appOrParcel) {
  return Promise.resolve().then(() => {
    const unloadInfo = appsToUnload[toName(appOrParcel)];

    if (!unloadInfo) {
      /* No one has called unloadApplication for this app,
       */
      return appOrParcel;
    }

    if (appOrParcel.status === NOT_LOADED) {
      /* This app is already unloaded. We just need to clean up
       * anything that still thinks we need to unload the app.
       */
      finishUnloadingApp(appOrParcel, unloadInfo);
      return appOrParcel;
    }

    if (appOrParcel.status === UNLOADING) {
      /* Both unloadApplication and reroute want to unload this app.
       * It only needs to be done once, though.
       */
      return unloadInfo.promise.then(() => appOrParcel);
    }

    if (
      appOrParcel.status !== NOT_MOUNTED &&
      appOrParcel.status !== LOAD_ERROR
    ) {
      /* The app cannot be unloaded until it is unmounted.
       */
      return appOrParcel;
    }

    let startTime;

    if (__PROFILE__) {
      startTime = performance.now();
    }

    const unloadPromise =
      appOrParcel.status === LOAD_ERROR
        ? Promise.resolve()
        : reasonableTime(appOrParcel, "unload");

    appOrParcel.status = UNLOADING;

    return unloadPromise
      .then(() => {
        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(appOrParcel),
            "unload",
            startTime,
            performance.now(),
            true
          );
        }

        finishUnloadingApp(appOrParcel, unloadInfo);

        return appOrParcel;
      })
      .catch((err) => {
        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(appOrParcel),
            "unload",
            startTime,
            performance.now(),
            false
          );
        }

        errorUnloadingApp(appOrParcel, unloadInfo, err);

        return appOrParcel;
      });
  });
}

function finishUnloadingApp(app, unloadInfo) {
  delete appsToUnload[toName(app)];

  // Unloaded apps don't have lifecycles
  delete app.bootstrap;
  delete app.mount;
  delete app.unmount;
  delete app.unload;

  app.status = NOT_LOADED;

  /* resolve the promise of whoever called unloadApplication.
   * This should be done after all other cleanup/bookkeeping
   */
  unloadInfo.resolve();
}

function errorUnloadingApp(app, unloadInfo, err) {
  delete appsToUnload[toName(app)];

  // Unloaded apps don't have lifecycles
  delete app.bootstrap;
  delete app.mount;
  delete app.unmount;
  delete app.unload;

  handleAppError(err, app, SKIP_BECAUSE_BROKEN);
  unloadInfo.reject(err);
}

export function addAppToUnload(app, promiseGetter, resolve, reject) {
  appsToUnload[toName(app)] = { app, resolve, reject };
  Object.defineProperty(appsToUnload[toName(app)], "promise", {
    get: promiseGetter,
  });
}

export function getAppUnloadInfo(appName) {
  return appsToUnload[appName];
}
