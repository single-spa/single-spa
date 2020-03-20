import { ensureJQuerySupport } from "../jquery-support.js";
import {
  isActive,
  isLoaded,
  isntLoaded,
  toName,
  NOT_LOADED,
  shouldBeActive,
  shouldntBeActive,
  isntActive,
  notSkipped,
  withoutLoadErrors
} from "./app.helpers.js";
import { reroute } from "../navigation/reroute.js";
import { find } from "../utils/find.js";
import { toUnmountPromise } from "../lifecycles/unmount.js";
import {
  toUnloadPromise,
  getAppUnloadInfo,
  addAppToUnload
} from "../lifecycles/unload.js";
import { formatErrorMessage } from "./app-errors.js";
import { isInBrowser } from "../utils/runtime-environment.js";

const apps = [];

export function getMountedApps() {
  return apps.filter(isActive).map(toName);
}

export function getAppNames() {
  return apps.map(toName);
}

// used in devtools, not (currently) exposed as a single-spa API
export function getRawAppData() {
  return [...apps];
}

export function getAppStatus(appName) {
  const app = find(apps, app => toName(app) === appName);
  return app ? app.status : null;
}

export function registerApplication(...args) {
  const { name, loadImpl, activityFn, customProps } = sanitizeAPI(args);

  if (getAppNames().indexOf(name) !== -1)
    throw Error(
      formatErrorMessage(
        21,
        __DEV__ && `There is already an app declared with name ${name}`,
        name
      )
    );

  apps.push({
    loadErrorTime: null,
    name,
    loadImpl,
    activeWhen: activityFn,
    status: NOT_LOADED,
    parcels: {},
    devtools: {
      overlays: {
        options: {},
        selectors: []
      }
    },
    customProps
  });

  if (isInBrowser) {
    ensureJQuerySupport();
    reroute();
  }
}

export function checkActivityFunctions(location) {
  return apps.filter(app => app.activeWhen(location)).map(toName);
}

export function getAppsToLoad() {
  return apps
    .filter(notSkipped)
    .filter(withoutLoadErrors)
    .filter(isntLoaded)
    .filter(shouldBeActive);
}

export function getAppsToUnmount() {
  return apps
    .filter(notSkipped)
    .filter(isActive)
    .filter(shouldntBeActive);
}

export function getAppsToMount() {
  return apps
    .filter(notSkipped)
    .filter(isntActive)
    .filter(isLoaded)
    .filter(shouldBeActive);
}

export function unregisterApplication(appName) {
  if (!apps.find(app => toName(app) === appName)) {
    throw Error(
      formatErrorMessage(
        25,
        __DEV__ &&
          `Cannot unregister application '${appName}' because no such application has been registered`,
        appName
      )
    );
  }

  return unloadApplication(appName).then(() => {
    const appIndex = apps.findIndex(app => toName(app) === appName);
    apps.splice(appIndex, 1);
  });
}

export function unloadApplication(appName, opts = { waitForUnmount: false }) {
  if (typeof appName !== "string") {
    throw Error(
      formatErrorMessage(
        26,
        __DEV__ && `unloadApplication requires a string 'appName'`
      )
    );
  }
  const app = find(apps, App => toName(App) === appName);
  if (!app) {
    throw Error(
      formatErrorMessage(
        27,
        __DEV__ &&
          `Could not unload application '${appName}' because no such application has been registered`,
        appName
      )
    );
  }

  const appUnloadInfo = getAppUnloadInfo(toName(app));
  if (opts && opts.waitForUnmount) {
    // We need to wait for unmount before unloading the app

    if (appUnloadInfo) {
      // Someone else is already waiting for this, too
      return appUnloadInfo.promise;
    } else {
      // We're the first ones wanting the app to be resolved.
      const promise = new Promise((resolve, reject) => {
        addAppToUnload(app, () => promise, resolve, reject);
      });
      return promise;
    }
  } else {
    /* We should unmount the app, unload it, and remount it immediately.
     */

    let resultPromise;

    if (appUnloadInfo) {
      // Someone else is already waiting for this app to unload
      resultPromise = appUnloadInfo.promise;
      immediatelyUnloadApp(app, appUnloadInfo.resolve, appUnloadInfo.reject);
    } else {
      // We're the first ones wanting the app to be resolved.
      resultPromise = new Promise((resolve, reject) => {
        addAppToUnload(app, () => resultPromise, resolve, reject);
        immediatelyUnloadApp(app, resolve, reject);
      });
    }

    return resultPromise;
  }
}

function immediatelyUnloadApp(app, resolve, reject) {
  toUnmountPromise(app)
    .then(toUnloadPromise)
    .then(() => {
      resolve();
      setTimeout(() => {
        // reroute, but the unload promise is done
        reroute();
      });
    })
    .catch(reject);
}

export function validateArgumentsTypeAPI(
  appName,
  applicationOrLoadingFn,
  activityFn,
  customProps
) {
  if (typeof appName !== "string" || appName.length === 0)
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          `The first argument to registerApplication must be a non-empty string 'appName'`
      )
    );

  if (!applicationOrLoadingFn)
    throw Error(
      formatErrorMessage(
        23,
        __DEV__ && "The application or loading function is required"
      )
    );

  if (typeof activityFn !== "function")
    throw Error(
      formatErrorMessage(
        24,
        __DEV__ && `The activityFunction argument must be a function`
      )
    );

  if (
    !!customProps &&
    (typeof customProps !== "object" || Array.isArray(customProps))
  )
    throw Error(
      formatErrorMessage(
        22,
        __DEV__ && "optional customProps must be an object"
      )
    );
}

export function validateRegisterObjectAPI(configurationObject) {
  const validKeys = ["name", "load", "isActive", "customProps"];

  const invalidPassedKeys = Object.keys(configurationObject).reduce(
    (invalidKeys, prop) =>
      validKeys.includes(prop) ? invalidKeys : invalidKeys.concat(prop),
    []
  );

  if (invalidPassedKeys.length !== 0)
    throw Error(
      formatErrorMessage(
        30,
        __DEV__ &&
          `The configuration object valid keys is: ${validKeys.join(
            ", "
          )}. Invalid keys: ${invalidPassedKeys.join(", ")}.`
      )
    );

  validateArgumentsTypeAPI(
    configurationObject.name,
    configurationObject.load,
    configurationObject.isActive,
    configurationObject.customProps
  );
}

function sanitizeAPI(args) {
  let name;
  let activityFn;
  let applicationOrLoadingFn;
  let customProps;
  const usingObjectAPI =
    typeof args[0] === "object" && args[0] !== null && !Array.isArray(args[0]);

  if (usingObjectAPI) {
    const [objectAPI] = args;
    validateRegisterObjectAPI(objectAPI);
    name = objectAPI.name;
    activityFn = objectAPI.isActive;
    applicationOrLoadingFn = objectAPI.load;
    customProps = objectAPI.customProps;
  } else {
    validateArgumentsTypeAPI(...args);
    [name, applicationOrLoadingFn, activityFn, customProps] = args;
  }

  let loadImpl;
  if (typeof applicationOrLoadingFn !== "function") {
    // applicationOrLoadingFn is an application
    loadImpl = () => Promise.resolve(applicationOrLoadingFn);
  } else {
    // applicationOrLoadingFn is a loadingFn
    loadImpl = applicationOrLoadingFn;
  }

  return {
    name,
    loadImpl,
    activityFn,
    customProps: customProps || {}
  };
}
