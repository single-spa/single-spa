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
    if (Array.isArray(app.activeWhen))
      return app.activeWhen.some(conditionForAppActivationMet);
    return conditionForAppActivationMet(app.activeWhen);
  } catch (err) {
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
  }

  function conditionForAppActivationMet(pathPrefixOrActivityFn) {
    const { location } = window;
    if (typeof pathPrefixOrActivityFn === "string") {
      const hashRouting = pathPrefixOrActivityFn.startsWith("/#/");
      const [
        dynamicIndexes,
        pathPrefixWithoutDynamic,
      ] = pathPrefixOrActivityFn.split("/").reduce(
        ([dynamicIndexes, pathPrefixWithoutDynamic], path, index) => {
          if (path.includes(":")) {
            return [
              dynamicIndexes.concat(index),
              pathPrefixWithoutDynamic.concat(""),
            ];
          }

          return [dynamicIndexes, pathPrefixWithoutDynamic.concat(path)];
        },
        [[], []]
      );
      const currentPath = hashRouting ? `/${location.hash}` : location.pathname;
      const replaceDynamicWitEmptyString = (path) =>
        path
          .split("/")
          .map((item, index) => (dynamicIndexes.includes(index) ? "" : item))
          .join("/");
      return replaceDynamicWitEmptyString(currentPath).startsWith(
        pathPrefixWithoutDynamic.join("/")
      );
    }

    if (typeof pathPrefixOrActivityFn === "function") {
      return pathPrefixOrActivityFn(location);
    }
  }
}

export function shouldntBeActive(app) {
  try {
    return !shouldBeActive(app);
  } catch (err) {
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
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
  return app.name;
}

export function isParcel(appOrParcel) {
  return Boolean(appOrParcel.unmountThisParcel);
}

export function objectType(appOrParcel) {
  return isParcel(appOrParcel) ? "parcel" : "application";
}
