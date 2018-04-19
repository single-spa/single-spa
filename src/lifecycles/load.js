import { NOT_BOOTSTRAPPED, LOADING_SOURCE_CODE, SKIP_BECAUSE_BROKEN, NOT_LOADED } from '../applications/app.helpers.js';
import { ensureValidAppTimeouts } from '../applications/timeouts.js';
import { handleAppError } from '../applications/app-errors.js';
import { find } from 'src/utils/find.js';
import { flattenFnArray, smellsLikeAPromise, validLifecycleFn } from './lifecycle.helpers.js';
import { getProps } from './prop.helpers.js';

export function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_LOADED) {
      return app;
    }

    app.status = LOADING_SOURCE_CODE;

    let appOpts;

    return Promise.resolve().then(() => {
      const loadPromise = app.loadImpl(getProps(app));
      if (!smellsLikeAPromise(loadPromise)) {
        // The name of the app will be prepended to this error message inside of the handleAppError function
        throw new Error(`single-spa loading function did not return a promise. Check the second argument to registerApplication('${app.name}', loadingFunction, activityFunction)`);
      }
      return loadPromise.then(val => {
        appOpts = val;

        let validationErrMessage;

        if (typeof appOpts !== 'object') {
          validationErrMessage = `does not export anything`;
        }

        if (!validLifecycleFn(appOpts.bootstrap)) {
          validationErrMessage = `does not export a bootstrap function or array of functions`;
        }

        if (!validLifecycleFn(appOpts.mount)) {
          validationErrMessage = `does not export a mount function or array of functions`;
        }

        if (!validLifecycleFn(appOpts.unmount)) {
          validationErrMessage = `does not export an unmount function or array of functions`;
        }

        if (validationErrMessage) {
          handleAppError(validationErrMessage, app);
          app.status = SKIP_BECAUSE_BROKEN;
          return app;
        }

        app.status = NOT_BOOTSTRAPPED;
        app.bootstrap = flattenFnArray(appOpts.bootstrap, `App '${app.name}' bootstrap function`);
        app.mount = flattenFnArray(appOpts.mount, `App '${app.name}' mount function`);
        app.unmount = flattenFnArray(appOpts.unmount, `App '${app.name}' unmount function`);
        app.unload = flattenFnArray(appOpts.unload || [], `App '${app.name}' unload function`);
        app.timeouts = ensureValidAppTimeouts(appOpts.timeouts);

        return app;
      })
    })
    .catch(err => {
      handleAppError(err, app);
      app.status = SKIP_BECAUSE_BROKEN;
      return app;
    })
  })
}
