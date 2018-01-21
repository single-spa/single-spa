import { NOT_BOOTSTRAPPED, LOADING_SOURCE_CODE, SKIP_BECAUSE_BROKEN, NOT_LOADED, getAppProps } from '../app.helpers.js';
import { ensureValidAppTimeouts } from '../timeouts.js';
import { handleAppError } from '../app-errors.js';
import { find } from 'src/utils/find.js';

export async function toLoadPromise(app) {
  if (app.status !== NOT_LOADED) {
    return app;
  }

  app.status = LOADING_SOURCE_CODE;

  let appOpts;

  try {
    const loadPromise = app.loadImpl(getAppProps(app));
    if (!smellsLikeAPromise(loadPromise)) {
      // The name of the app will be prepended to this error message inside of the handleAppError function
      throw new Error(`single-spa loading function did not return a promise. Check the second argument to registerApplication('${app.name}', loadingFunction, activityFunction)`);
    }
    appOpts = await loadPromise;
  } catch(err) {
    handleAppError(err, app);
    app.status = SKIP_BECAUSE_BROKEN;
    return app;
  }

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
}

function validLifecycleFn(fn) {
  return fn && (typeof fn === 'function' || isArrayOfFns(fn));

  function isArrayOfFns(arr) {
    return Array.isArray(arr) && !find(arr, item => typeof item !== 'function');
  }
}

function flattenFnArray(fns, description) {
  fns = Array.isArray(fns) ? fns : [fns];
  if (fns.length === 0) {
    fns = [() => Promise.resolve()];
  }

  return function(props) {
    return new Promise((resolve, reject) => {
      waitForPromises(0);

      function waitForPromises(index) {
        const promise = fns[index](props);
        if (!smellsLikeAPromise(promise)) {
          reject(`${description} at index ${index} did not return a promise`);
        } else {
          promise
            .then(() => {
              if (index === fns.length - 1) {
                resolve();
              } else {
                waitForPromises(index + 1);
              }
            })
            .catch(reject);
        }
      }
    });
  }
}

function smellsLikeAPromise(promise) {
  return promise && typeof promise.then === 'function' && typeof promise.catch === 'function';
}
