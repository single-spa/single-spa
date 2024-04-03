import {
  ActivityFn,
  AppOrParcel,
  CustomProps,
  LoadApp,
  ParcelMap,
} from "../lifecycles/lifecycle.helpers";
import { handleAppError } from "./app-errors";
import { AppOrParcelTimeouts } from "./timeouts";

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

export function objectType(appOrParcel: AppOrParcel): "parcel" | "application" {
  return isParcel(appOrParcel) ? "parcel" : "application";
}

export interface InternalApplication {
  name: string;
  activeWhen: ActivityFn;
  loadApp: LoadApp;
  status: AppOrParcelStatus;
  loadErrorTime: number;
  parcels: ParcelMap;
  customProps?: CustomProps;
  // The ensureValidAppTimeouts function gets called once the app is loaded
  timeouts?: AppOrParcelTimeouts;
  devtools: AppDevtools;
}

export interface AppDevtools {
  overlays: {
    options: OverlayOptions;
    selectors: string[];
  };
}

// https://github.com/single-spa/single-spa-inspector/blob/ac3e1ded68e94239dd02d04f8a094ed8e6dfefc2/src/inspected-window-helpers/overlay-helpers.js#L53
interface OverlayOptions {
  color?: string;
  background?: string;
  classes?: string[];
  height?: string;
  left?: string;
  position?: string;
  top?: string;
  width?: string;
  zIndex?: string | number;
  textColor?: string;
  textBlocks?: string[];
}
