import { handleAppError, formatErrorMessage } from "./app-errors.js";

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
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
  }
}

export function shouldntBeActive(app) {
  try {
    return !app.activeWhen(window.location);
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

export function validateArgumentsTypeAPI(
  appName,
  applicationOrLoadingFn,
  activityFn,
  customProps
) {
  if (typeof appName !== "string" || appName.length === 0)
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          `The first argument to registerApplication must be a non-empty string 'appName'`
      )
    );

  if (!applicationOrLoadingFn)
    throw Error(
      formatErrorMessage(
        23,
        __DEV__ && "The application or loading function is required"
      )
    );

  if (typeof activityFn !== "function")
    throw Error(
      formatErrorMessage(
        24,
        __DEV__ && `The activityFunction argument must be a function`
      )
    );

  if (
    !!customProps &&
    (typeof customProps !== "object" || Array.isArray(customProps))
  )
    throw Error(
      formatErrorMessage(
        22,
        __DEV__ && "optional customProps must be an object"
      )
    );
}

export function validateRegisterObjectAPI(configurationObject) {
  const validKeys = ["name", "load", "isActive", "customProps"];

  const invalidPassedKeys = Object.keys(configurationObject).reduce(
    (invalidKeys, prop) =>
      validKeys.includes(prop) ? invalidKeys : invalidKeys.concat(prop),
    []
  );

  if (invalidPassedKeys.length !== 0)
    throw Error(
      formatErrorMessage(
        30,
        __DEV__ &&
          `The configuration object valid keys is: ${validKeys.join(
            ", "
          )}. Invalid keys: ${invalidPassedKeys.join(", ")}.`
      )
    );

  validateArgumentsTypeAPI(
    configurationObject.name,
    configurationObject.load,
    configurationObject.isActive,
    configurationObject.customProps
  );
}

export function sanitizeAPI(args) {
  let name;
  let activityFn;
  let applicationOrLoadingFn;
  let customProps;
  const usingObjectAPI =
    typeof args[0] === "object" && args[0] !== null && !Array.isArray(args[0]);

  if (usingObjectAPI) {
    const [objectAPI] = args;
    validateRegisterObjectAPI(objectAPI);
    name = objectAPI.name;
    activityFn = objectAPI.isActive;
    applicationOrLoadingFn = objectAPI.load;
    customProps = objectAPI.customProps;
  } else {
    validateArgumentsTypeAPI(...args);
    [name, applicationOrLoadingFn, activityFn, customProps] = args;
  }

  let loadImpl;
  if (typeof applicationOrLoadingFn !== "function") {
    // applicationOrLoadingFn is an application
    loadImpl = () => Promise.resolve(applicationOrLoadingFn);
  } else {
    // applicationOrLoadingFn is a loadingFn
    loadImpl = applicationOrLoadingFn;
  }

  return {
    name,
    loadImpl,
    activityFn,
    customProps: customProps || {}
  };
}
