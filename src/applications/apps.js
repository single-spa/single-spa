import { ensureJQuerySupport } from '../jquery-support.js';
import { isActive, isLoaded, isntLoaded, toName, NOT_LOADED, shouldBeActive, shouldntBeActive, isntActive, notSkipped } from './app.helpers.js';
import { reroute } from 'src/navigation/reroute.js';
import { find } from 'src/utils/find.js';
import { toUnmountPromise } from 'src/lifecycles/unmount.js';
import { toUnloadPromise, getAppUnloadInfo, addAppToUnload } from 'src/lifecycles/unload.js';

const apps = [];

export function getMountedApps() {
  return apps.filter(isActive).map(toName);
}

export function getAppNames() {
  return apps.map(toName);
}

export function getAppStatus(appName) {
  const app = find(apps, app => app.name === appName);
  return app ? app.status : null;
}

export function declareChildApplication(appName, arg1, arg2) {
  console.warn('declareChildApplication is deprecated and will be removed in the next major version, use "registerApplication" instead')
  return registerApplication(appName, arg1, arg2)
}

export function registerApplication(appName, applicationOrLoadingFn, activityFn, customProps = {}) {
  if (typeof appName !== 'string' || appName.length === 0)
    throw new Error(`The first argument must be a non-empty string 'appName'`);
  if (getAppNames().indexOf(appName) !== -1)
    throw new Error(`There is already an app declared with name ${appName}`);
  if (typeof customProps !== 'object' || Array.isArray(customProps))
    throw new Error('customProps must be an object');

  if (!applicationOrLoadingFn)
    throw new Error(`The application or loading function is required`);

  let loadImpl;
  if (typeof applicationOrLoadingFn !== 'function') {
    // applicationOrLoadingFn is an application
    loadImpl = () => Promise.resolve(applicationOrLoadingFn);
  } else {
    // applicationOrLoadingFn is a loadingFn
    loadImpl = applicationOrLoadingFn;
  }

  if (typeof activityFn !== 'function')
    throw new Error(`The activeWhen argument must be a function`);

  apps.push({
    name: appName,
    loadImpl,
    activeWhen: activityFn,
    status: NOT_LOADED,
    parcels: {},
    customProps
  });

  ensureJQuerySupport();

  reroute();
}

export function checkActivityFunctions(location) {
  const activeApps = []
  for (let i = 0; i < apps.length; i++) {
    if (apps[i].activeWhen(location)) {
      activeApps.push(apps[i].name)
    }
  }
  return activeApps
}

export function getAppsToLoad() {
  return apps
    .filter(notSkipped)
    .filter(isntLoaded)
    .filter(shouldBeActive)
}

export function getAppsToUnmount() {
  return apps
    .filter(notSkipped)
    .filter(isActive)
    .filter(shouldntBeActive)
}

export function getAppsToMount() {
  return apps
    .filter(notSkipped)
    .filter(isntActive)
    .filter(isLoaded)
    .filter(shouldBeActive)
}

export function unloadChildApplication(appName, opts) {
  console.warn('unloadChildApplication is deprecated and will be removed in the next major version, use "unloadApplication" instead')
  return unloadApplication(appName, opts)
}

export function unloadApplication(appName, opts={waitForUnmount: false}) {
  if (typeof appName !== 'string') {
    throw new Error(`unloadApplication requires a string 'appName'`);
  }
  const app = find(apps, App => App.name === appName);
  if (!app) {
    throw new Error(`Could not unload application '${appName}' because no such application has been declared`);
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
      resolve()
      setTimeout(() => {
        // reroute, but the unload promise is done
        reroute()
      });
    })
    .catch(reject);
}
