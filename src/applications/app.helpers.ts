import { handleAppError } from "./app-errors.js";

// App statuses
export enum AppOrParcelStatus {
  NOT_LOADED = "NOT_LOADED",
  LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE",
  NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED",
  BOOTSTRAPPING = "BOOTSTRAPPING",
  NOT_MOUNTED = "NOT_MOUNTED",
  MOUNTING = "MOUNTING",
  MOUNTED = "MOUNTED",
  UPDATING = "UPDATING",
  UNMOUNTING = "UNMOUNTING",
  UNLOADING = "UNLOADING",
  LOAD_ERROR = "LOAD_ERROR",
  SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN",
}

export const NOT_LOADED = AppOrParcelStatus.NOT_LOADED;
export const LOADING_SOURCE_CODE = AppOrParcelStatus.LOADING_SOURCE_CODE;
export const NOT_BOOTSTRAPPED = AppOrParcelStatus.NOT_BOOTSTRAPPED;
export const BOOTSTRAPPING = AppOrParcelStatus.BOOTSTRAPPING;
export const NOT_MOUNTED = AppOrParcelStatus.NOT_MOUNTED;
export const MOUNTING = AppOrParcelStatus.MOUNTING;
export const MOUNTED = AppOrParcelStatus.MOUNTED;
export const UPDATING = AppOrParcelStatus.UPDATING;
export const UNMOUNTING = AppOrParcelStatus.UNMOUNTING;
export const UNLOADING = AppOrParcelStatus.UNLOADING;
export const LOAD_ERROR = AppOrParcelStatus.LOAD_ERROR;
export const SKIP_BECAUSE_BROKEN = AppOrParcelStatus.SKIP_BECAUSE_BROKEN;

export function isActive(app) {
  return app.status === MOUNTED;
}

export function shouldBeActive(app) {
  try {
    return app.activeWhen(window.location);
  } catch (err) {
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
    return false;
  }
}

export function toName(app) {
  return app.name;
}

export function isParcel(appOrParcel) {
  return Boolean(appOrParcel.unmountThisParcel);
}

export function objectType(appOrParcel) {
  return isParcel(appOrParcel) ? "parcel" : "application";
}
