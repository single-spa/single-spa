import { handleAppError } from "./app-errors.js";

// App statuses
export const NOT_LOADED = "NOT_LOADED";
export const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE";
export const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED";
export const BOOTSTRAPPING = "BOOTSTRAPPING";
export const NOT_MOUNTED = "NOT_MOUNTED";
export const MOUNTING = "MOUNTING";
export const MOUNTED = "MOUNTED";
export const UPDATING = "UPDATING";
export const UNMOUNTING = "UNMOUNTING";
export const UNLOADING = "UNLOADING";
export const LOAD_ERROR = "LOAD_ERROR";
export const SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN";

export function isActive(app) {
  return app.status === MOUNTED;
}

export function isntActive(app) {
  return !isActive(app);
}

export function isLoaded(app) {
  return (
    app.status !== NOT_LOADED &&
    app.status !== LOADING_SOURCE_CODE &&
    app.status !== LOAD_ERROR
  );
}

export function isntLoaded(app) {
  return !isLoaded(app);
}

export function shouldBeActive(app) {
  try {
    return app.activeWhen(window.location);
  } catch (err) {
    handleAppError(err, app);
    app.status = SKIP_BECAUSE_BROKEN;
  }
}

export function shouldntBeActive(app) {
  try {
    return !app.activeWhen(window.location);
  } catch (err) {
    handleAppError(err, app);
    app.status = SKIP_BECAUSE_BROKEN;
  }
}

export function notSkipped(item) {
  return (
    item !== SKIP_BECAUSE_BROKEN &&
    (!item || item.status !== SKIP_BECAUSE_BROKEN)
  );
}

export function withoutLoadErrors(app) {
  return app.status === LOAD_ERROR
    ? new Date().getTime() - app.loadErrorTime >= 200
    : true;
}

export function toName(app) {
  return app.appOrParcelName;
}

export function isParcel(appOrParcel) {
  return Boolean(appOrParcel.unmountThisParcel);
}

export function objectType(appOrParcel) {
  return isParcel(appOrParcel) ? "parcel" : "application";
}
