export { start } from './start.js';
export { ensureJQuerySupport } from './jquery-support.js';
export { setBootstrapMaxTime, setMountMaxTime, setUnmountMaxTime, setUnloadMaxTime } from './applications/timeouts.js';
export { registerApplication, getMountedApps, getAppStatus, unloadApplication, checkActivityFunctions, getAppNames, declareChildApplication, unloadChildApplication } from './applications/apps.js';
export { navigateToUrl } from './navigation/navigation-events.js';
export { reroute as triggerAppChange } from './navigation/reroute.js';
export { addErrorHandler, removeErrorHandler } from './applications/app-errors.js';
export { mountRootParcel } from 'src/parcels/mount-parcel.js';

export {
  NOT_LOADED,
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  BOOTSTRAPPING,
  NOT_MOUNTED,
  MOUNTING,
  UPDATING,
  MOUNTED,
  UNMOUNTING,
  SKIP_BECAUSE_BROKEN,
} from './applications/app.helpers.js';
