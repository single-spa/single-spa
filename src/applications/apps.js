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
import { devErrorMessage, prodErrorMessage } from "./app-errors.js";

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
  const app = find(apps, app => app.name === appName);
  return app ? app.status : null;
}

export function registerApplication(
  appName,
  applicationOrLoadingFn,
  activityFn,
  customProps = {}
) {
  if (typeof appName !== "string" || appName.length === 0)
    throw Error(
      __DEV__
        ? devErrorMessage(
            20,
            `The first argument must be a non-empty string 'appName'`
          )
        : prodErrorMessage(20)
    );
  if (getAppNames().indexOf(appName) !== -1)
    throw Error(
      __DEV__
        ? devErrorMessage(
            21,
            `There is already an app declared with name ${appName}`,
            appName
          )
        : prodErrorMessage(21, appName)
    );
  if (typeof customProps !== "object" || Array.isArray(customProps))
    throw Error(
      __DEV__
        ? devErrorMessage(22, "customProps must be an object")
        : prodErrorMessage(22)
    );

  if (!applicationOrLoadingFn)
    throw Error(
      __DEV__
        ? devErrorMessage(23, `The application or loading function is required`)
        : prodErrorMessage(23)
    );

  let loadImpl;
  if (typeof applicationOrLoadingFn !== "function") {
    // applicationOrLoadingFn is an application
    loadImpl = () => Promise.resolve(applicationOrLoadingFn);
  } else {
    // applicationOrLoadingFn is a loadingFn
    loadImpl = applicationOrLoadingFn;
  }

  if (typeof activityFn !== "function")
    throw Error(
      __DEV__
        ? devErrorMessage(24, `The activeWhen argument must be a function`)
        : prodErrorMessage(24)
    );

  apps.push({
    loadErrorTime: null,
    name: appName,
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

  ensureJQuerySupport();

  reroute();
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
  if (!apps.find(app => app.name === appName)) {
    throw Error(
      __DEV__
        ? devErrorMessage(
            25,
            `Cannot unregister application '${appName}' because no such application has been registered`,
            appName
          )
        : prodErrorMessage(25, appName)
    );
  }

  return unloadApplication(appName).then(() => {
    const appIndex = apps.findIndex(app => app.name === appName);
    apps.splice(appIndex, 1);
  });
}

export function unloadApplication(appName, opts = { waitForUnmount: false }) {
  if (typeof appName !== "string") {
    throw Error(
      __DEV__
        ? devErrorMessage(26, `unloadApplication requires a string 'appName'`)
        : prodErrorMessage(26)
    );
  }
  const app = find(apps, App => App.name === appName);
  if (!app) {
    throw Error(
      __DEV__
        ? devErrorMessage(
            27,
            `Could not unload application '${appName}' because no such application has been registered`,
            appName
          )
        : prodErrorMessage(27, appName)
    );
  }

  const appUnloadInfo = getAppUnloadInfo(app.name);
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
