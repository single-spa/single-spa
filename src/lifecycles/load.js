import {
  LOAD_ERROR,
  NOT_BOOTSTRAPPED,
  LOADING_SOURCE_CODE,
  SKIP_BECAUSE_BROKEN,
  NOT_LOADED,
  objectType
} from "../applications/app.helpers.js";
import { ensureValidAppTimeouts } from "../applications/timeouts.js";
import {
  handleAppError,
  devErrorMessage,
  prodErrorMessage
} from "../applications/app-errors.js";
import {
  flattenFnArray,
  smellsLikeAPromise,
  validLifecycleFn
} from "./lifecycle.helpers.js";
import { getProps } from "./prop.helpers.js";

export function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
      return app;
    }

    app.status = LOADING_SOURCE_CODE;

    let appOpts, isUserErr;

    return Promise.resolve()
      .then(() => {
        const loadPromise = app.loadImpl(getProps(app));
        if (!smellsLikeAPromise(loadPromise)) {
          // The name of the app will be prepended to this error message inside of the handleAppError function
          isUserErr = true;
          throw Error(
            __DEV__
              ? devErrorMessage(
                  33,
                  `single-spa loading function did not return a promise. Check the second argument to registerApplication('${app.name}', loadingFunction, activityFunction)`,
                  app.name
                )
              : prodErrorMessage(33, app.name)
          );
        }
        return loadPromise.then(val => {
          app.loadErrorTime = null;

          appOpts = val;

          let validationErrMessage, validationErrCode;

          if (typeof appOpts !== "object") {
            validationErrCode = 34;
            if (__DEV__) {
              validationErrMessage = `does not export anything`;
            }
          }

          if (!validLifecycleFn(appOpts.bootstrap)) {
            validationErrCode = 35;
            if (__DEV__) {
              validationErrMessage = `does not export a bootstrap function or array of functions`;
            }
          }

          if (!validLifecycleFn(appOpts.mount)) {
            validationErrCode = 36;
            if (__DEV__) {
              validationErrMessage = `does not export a bootstrap function or array of functions`;
            }
          }

          if (!validLifecycleFn(appOpts.unmount)) {
            validationErrCode = 37;
            if (__DEV__) {
              validationErrMessage = `does not export a bootstrap function or array of functions`;
            }
          }

          const type = objectType(appOpts);

          if (validationErrCode) {
            let appOptsStr;
            try {
              appOptsStr = JSON.stringify(appOpts);
            } catch {}
            console.error(
              __DEV__
                ? devErrorMessage(
                    validationErrCode,
                    `The loading function for single-spa ${type} '${app.name}' resolved with the following, which does not have bootstrap, mount, and unmount functions`,
                    type,
                    app.name,
                    appOptsStr
                  )
                : prodErrorMessage(
                    validationErrCode,
                    type,
                    app.name,
                    appOptsStr
                  ),
              appOpts
            );
            handleAppError(validationErrMessage, app);
            app.status = SKIP_BECAUSE_BROKEN;
            return app;
          }

          if (appOpts.devtools && appOpts.devtools.overlays) {
            app.devtools.overlays = {
              ...app.devtools.overlays,
              ...appOpts.devtools.overlays
            };
          }

          app.status = NOT_BOOTSTRAPPED;
          app.bootstrap = flattenFnArray(appOpts, "bootstrap");
          app.mount = flattenFnArray(appOpts, "mount");
          app.unmount = flattenFnArray(appOpts, "unmount");
          app.unload = flattenFnArray(appOpts, "unload");
          app.timeouts = ensureValidAppTimeouts(appOpts.timeouts);

          return app;
        });
      })
      .catch(err => {
        handleAppError(err, app);
        if (isUserErr) {
          app.status = SKIP_BECAUSE_BROKEN;
        } else {
          app.status = LOAD_ERROR;
          app.loadErrorTime = new Date().getTime();
        }

        return app;
      });
  });
}
