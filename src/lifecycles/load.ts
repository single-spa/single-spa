import {
  LOAD_ERROR,
  NOT_BOOTSTRAPPED,
  LOADING_SOURCE_CODE,
  SKIP_BECAUSE_BROKEN,
  NOT_LOADED,
  toName,
  InternalApplication,
} from "../applications/app.helpers";
import { ensureValidAppTimeouts } from "../applications/timeouts";
import { handleAppError, formatErrorMessage } from "../applications/app-errors";
import {
  LifeCycles,
  LoadedApp,
  flattenFnArray,
  smellsLikeAPromise,
  validLifecycleFn,
} from "./lifecycle.helpers";
import { getProps } from "./prop.helpers";
import { addProfileEntry } from "../devtools/profiler";

export function toLoadPromise(
  app: InternalApplication | LoadedApp,
): Promise<LoadedApp | InternalApplication> {
  return Promise.resolve().then(() => {
    if ((app as LoadedApp).loadPromise) {
      return (app as LoadedApp).loadPromise;
    }

    if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
      return app;
    }

    let startTime: number;
    if (__PROFILE__) {
      startTime = performance.now();
    }

    const appBeingLoaded: InternalApplication & Partial<LoadedApp> = app;

    appBeingLoaded.status = LOADING_SOURCE_CODE;

    let lifecycles: LifeCycles, isUserErr: boolean;

    return (appBeingLoaded.loadPromise = Promise.resolve()
      .then(() => {
        const loadPromise = appBeingLoaded.loadApp(getProps(app));
        if (!smellsLikeAPromise(loadPromise)) {
          // The name of the app will be prepended to this error message inside of the handleAppError function
          isUserErr = true;
          throw Error(
            formatErrorMessage(
              33,
              __DEV__ &&
                `single-spa loading function did not return a promise. Check the second argument to registerApplication('${toName(
                  app,
                )}', loadingFunction, activityFunction)`,
              toName(appBeingLoaded),
            ),
          );
        }
        return loadPromise.then((val) => {
          appBeingLoaded.loadErrorTime = null;

          lifecycles = val;

          let validationErrMessage, validationErrCode;

          if (typeof lifecycles !== "object") {
            validationErrCode = 34;
            if (__DEV__) {
              validationErrMessage = `does not export anything`;
            }
          }

          if (
            // ES Modules don't have the Object prototype
            Object.prototype.hasOwnProperty.call(lifecycles, "bootstrap") &&
            !validLifecycleFn(lifecycles.bootstrap)
          ) {
            validationErrCode = 35;
            if (__DEV__) {
              validationErrMessage = `does not export a valid bootstrap function or array of functions`;
            }
          }

          if (!validLifecycleFn(lifecycles.mount)) {
            validationErrCode = 36;
            if (__DEV__) {
              validationErrMessage = `does not export a mount function or array of functions`;
            }
          }

          if (!validLifecycleFn(lifecycles.unmount)) {
            validationErrCode = 37;
            if (__DEV__) {
              validationErrMessage = `does not export a unmount function or array of functions`;
            }
          }

          if (validationErrCode) {
            let appOptsStr;
            try {
              appOptsStr = JSON.stringify(lifecycles);
            } catch {}
            console.error(
              formatErrorMessage(
                validationErrCode,
                __DEV__ &&
                  `The loading function for single-spa application '${toName(
                    appBeingLoaded,
                  )}' resolved with the following, which does not have bootstrap, mount, and unmount functions`,
                "application",
                toName(appBeingLoaded),
                appOptsStr,
              ),
              lifecycles,
            );
            handleAppError(
              validationErrMessage,
              appBeingLoaded,
              SKIP_BECAUSE_BROKEN,
            );
            return appBeingLoaded;
          }

          if (lifecycles.devtools && lifecycles.devtools.overlays) {
            appBeingLoaded.devtools.overlays = Object.assign(
              {},
              app.devtools.overlays,
              lifecycles.devtools.overlays,
            );
          }

          appBeingLoaded.status = NOT_BOOTSTRAPPED;
          appBeingLoaded.bootstrap = flattenFnArray(
            lifecycles,
            "bootstrap",
            false,
          );
          appBeingLoaded.mount = flattenFnArray(lifecycles, "mount", false);
          appBeingLoaded.unmount = flattenFnArray(lifecycles, "unmount", false);
          appBeingLoaded.unload = flattenFnArray(lifecycles, "unload", false);
          appBeingLoaded.timeouts = ensureValidAppTimeouts(lifecycles.timeouts);

          delete appBeingLoaded.loadPromise;

          if (__PROFILE__) {
            addProfileEntry(
              "application",
              toName(appBeingLoaded),
              "load",
              startTime,
              performance.now(),
              true,
            );
          }

          return appBeingLoaded as LoadedApp;
        });
      })
      .catch((err) => {
        delete appBeingLoaded.loadPromise;

        let newStatus;
        if (isUserErr) {
          newStatus = SKIP_BECAUSE_BROKEN;
        } else {
          newStatus = LOAD_ERROR;
          appBeingLoaded.loadErrorTime = new Date().getTime();
        }
        handleAppError(err, appBeingLoaded, newStatus);

        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(appBeingLoaded),
            "load",
            startTime,
            performance.now(),
            false,
          );
        }

        return appBeingLoaded as LoadedApp;
      }));
  });
}
