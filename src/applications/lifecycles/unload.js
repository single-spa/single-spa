import { NOT_MOUNTED, UNLOADING, NOT_LOADED, SKIP_BECAUSE_BROKEN, isntActive, getAppProps } from '../app.helpers.js';
import { handleAppError } from '../app-errors.js';
import { reasonableTime } from '../timeouts.js';

const appsToUnload = {};

export async function toUnloadPromise(app) {
  const unloadInfo = appsToUnload[app.name];

  if (app.status === NOT_LOADED) {
    /* This app is already unloaded. We just need to clean up
     * anything that still thinks we need to unload the app.
     */
    finishUnloadingApp(app, unloadInfo);
    return app;
  }

  if (app.status === UNLOADING) {
    /* Both unloadApplication and reroute want to unload this app.
     * It only needs to be done once, though.
     */
    await unloadInfo.promise;
    return app;
  }

  if (app.status !== NOT_MOUNTED) {
    /* The app cannot be unloaded until it is unmounted.
     */
    return app;
  }

  if (!unloadInfo) {
    /* No one has called unloadApplication for this app,
     */
    return app;
  }

  try {
    app.status = UNLOADING;
    await reasonableTime(app.unload(getAppProps(app)), `Unloading application '${app.name}'`, app.timeouts.unload);
  } catch (err) {
    errorUnloadingApp(app, unloadInfo, err);
    return app;
  }

  finishUnloadingApp(app, unloadInfo);

  return app;
}

function finishUnloadingApp(app, unloadInfo) {
  delete appsToUnload[app.name];

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
  delete appsToUnload[app.name];

  // Unloaded apps don't have lifecycles
  delete app.bootstrap;
  delete app.mount;
  delete app.unmount;
  delete app.unload;

  handleAppError(err, app);
  app.status = SKIP_BECAUSE_BROKEN;
  unloadInfo.reject(err);
}

export function addAppToUnload(app, promiseGetter, resolve, reject) {
  appsToUnload[app.name] = {app, resolve, reject};
  Object.defineProperty(appsToUnload[app.name], 'promise', {get: promiseGetter});
}

export function getAppUnloadInfo(appName) {
  return appsToUnload[appName];
}

export function getAppsToUnload() {
  return Object.keys(appsToUnload)
    .map(appName => appsToUnload[appName].app)
    .filter(isntActive)
}
