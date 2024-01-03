export { start } from "./start";
export { ensureJQuerySupport } from "./jquery-support";
export {
  setBootstrapMaxTime,
  setMountMaxTime,
  setUnmountMaxTime,
  setUnloadMaxTime,
} from "./applications/timeouts";
export {
  registerApplication,
  unregisterApplication,
  getMountedApps,
  getAppStatus,
  unloadApplication,
  checkActivityFunctions,
  getAppNames,
  pathToActiveWhen,
} from "./applications/apps";
export { navigateToUrl, patchHistoryApi } from "./navigation/navigation-events";
export { triggerAppChange } from "./navigation/reroute";
export { addErrorHandler, removeErrorHandler } from "./applications/app-errors";
export { mountRootParcel } from "./parcels/mount-parcel";

export {
  NOT_LOADED,
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  BOOTSTRAPPING,
  NOT_MOUNTED,
  MOUNTING,
  UPDATING,
  LOAD_ERROR,
  MOUNTED,
  UNLOADING,
  UNMOUNTING,
  SKIP_BECAUSE_BROKEN,
} from "./applications/app.helpers";

import devtools from "./devtools/devtools";
import { isInBrowser } from "./utils/runtime-environment";

if (isInBrowser && window.__SINGLE_SPA_DEVTOOLS__) {
  window.__SINGLE_SPA_DEVTOOLS__.exposedMethods = devtools;
}

declare global {
  interface Window {
    __SINGLE_SPA_DEVTOOLS__: devtools;
  }
}
