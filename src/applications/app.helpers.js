import { handleAppError } from './app-errors.js';
import * as singleSpa from 'src/single-spa.js';

// App statuses
export const NOT_LOADED = 'NOT_LOADED';
export const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE';
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED';
export const BOOTSTRAPPING = 'BOOTSTRAPPING';
export const NOT_MOUNTED = 'NOT_MOUNTED';
export const MOUNTING = 'MOUNTING';
export const MOUNTED = 'MOUNTED';
export const UPDATING = 'UPDATING';
export const UNMOUNTING = 'UNMOUNTING';
export const UNLOADING = 'UNLOADING';
export const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN';

export function isActive(app) {
  return app.status === MOUNTED;
}

export function isntActive(app) {
  return !isActive(app);
}

export function isLoaded(app) {
  return app.status !== NOT_LOADED && app.status !== LOADING_SOURCE_CODE;
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

export function notBootstrapped(app) {
  return app.status !== NOT_BOOTSTRAPPED;
}

export function notSkipped(item) {
  return item !== SKIP_BECAUSE_BROKEN && (!item || item.status !== SKIP_BECAUSE_BROKEN);
}

export function toName(app) {
  return app.name;
}
