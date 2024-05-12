import {
  LOAD_ERROR,
  NOT_BOOTSTRAPPED,
  LOADING_SOURCE_CODE,
  SKIP_BECAUSE_BROKEN,
  NOT_LOADED,
  objectType,
  toName,
} from "../applications/app.helpers.js";
import { ensureValidAppTimeouts } from "../applications/timeouts.js";
import {
  handleAppError,
  formatErrorMessage,
} from "../applications/app-errors.js";
import {
  flattenFnArray,
  smellsLikeAPromise,
  validLifecycleFn,
} from "./lifecycle.helpers.js";
import { getProps } from "./prop.helpers.js";
import { assign } from "../utils/assign.js";
import { addProfileEntry } from "../devtools/profiler.js";
import { logger } from "../utils/logging.js";

export function toLoadPromise(appOrParcel) {
  return Promise.resolve().then(() => {
    if (appOrParcel.loadPromise) {
      return appOrParcel.loadPromise;
    }

    if (
      appOrParcel.status !== NOT_LOADED &&
      appOrParcel.status !== LOAD_ERROR
    ) {
      return appOrParcel;
    }

    let startTime;

    if (__PROFILE__) {
      startTime = performance.now();
    }

    appOrParcel.status = LOADING_SOURCE_CODE;

    let appOpts, isUserErr;

    return (appOrParcel.loadPromise = Promise.resolve()
      .then(() => {
        const loadPromise = appOrParcel.loadApp(getProps(appOrParcel));
        if (!smellsLikeAPromise(loadPromise)) {
          // The name of the app will be prepended to this error message inside of the handleAppError function
          isUserErr = true;
          throw Error(
            formatErrorMessage(
              33,
              __DEV__ &&
                `single-spa loading function did not return a promise. Check the second argument to registerApplication('${toName(
                  appOrParcel
                )}', loadingFunction, activityFunction)`,
              toName(appOrParcel)
            )
          );
        }
        return loadPromise.then((val) => {
          appOrParcel.loadErrorTime = null;

          appOpts = val;

          let validationErrMessage, validationErrCode;

          if (typeof appOpts !== "object") {
            validationErrCode = 34;
            if (__DEV__) {
              validationErrMessage = `does not export anything`;
            }
          }

          if (
            // ES Modules don't have the Object prototype
            Object.prototype.hasOwnProperty.call(appOpts, "bootstrap") &&
            !validLifecycleFn(appOpts.bootstrap)
          ) {
            validationErrCode = 35;
            if (__DEV__) {
              validationErrMessage = `does not export a valid bootstrap function or array of functions`;
            }
          }

          if (!validLifecycleFn(appOpts.mount)) {
            validationErrCode = 36;
            if (__DEV__) {
              validationErrMessage = `does not export a mount function or array of functions`;
            }
          }

          if (!validLifecycleFn(appOpts.unmount)) {
            validationErrCode = 37;
            if (__DEV__) {
              validationErrMessage = `does not export a unmount function or array of functions`;
            }
          }

          const type = objectType(appOpts);

          if (validationErrCode) {
            let appOptsStr;
            try {
              appOptsStr = JSON.stringify(appOpts);
            } catch {}
            logger.error(
              formatErrorMessage(
                validationErrCode,
                __DEV__ &&
                  `The loading function for single-spa ${type} '${toName(
                    appOrParcel
                  )}' resolved with the following, which does not have bootstrap, mount, and unmount functions`,
                type,
                toName(appOrParcel),
                appOptsStr
              ),
              appOpts
            );
            handleAppError(
              validationErrMessage,
              appOrParcel,
              SKIP_BECAUSE_BROKEN
            );
            return appOrParcel;
          }

          if (appOpts.devtools && appOpts.devtools.overlays) {
            appOrParcel.devtools.overlays = assign(
              {},
              appOrParcel.devtools.overlays,
              appOpts.devtools.overlays
            );
          }

          appOrParcel.status = NOT_BOOTSTRAPPED;
          appOrParcel.bootstrap = flattenFnArray(appOpts, "bootstrap");
          appOrParcel.mount = flattenFnArray(appOpts, "mount");
          appOrParcel.unmount = flattenFnArray(appOpts, "unmount");
          appOrParcel.unload = flattenFnArray(appOpts, "unload");
          appOrParcel.timeouts = ensureValidAppTimeouts(appOpts.timeouts);

          delete appOrParcel.loadPromise;

          if (__PROFILE__) {
            addProfileEntry(
              "application",
              toName(appOrParcel),
              "load",
              startTime,
              performance.now(),
              true
            );
          }

          return appOrParcel;
        });
      })
      .catch((err) => {
        delete appOrParcel.loadPromise;

        let newStatus;
        if (isUserErr) {
          newStatus = SKIP_BECAUSE_BROKEN;
        } else {
          newStatus = LOAD_ERROR;
          appOrParcel.loadErrorTime = new Date().getTime();
        }
        handleAppError(err, appOrParcel, newStatus);

        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(appOrParcel),
            "load",
            startTime,
            performance.now(),
            false
          );
        }

        return appOrParcel;
      }));
  });
}
