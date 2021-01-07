import { ensureJQuerySupport } from "../jquery-support.js";
import {
  isActive,
  toName,
  NOT_LOADED,
  NOT_BOOTSTRAPPED,
  NOT_MOUNTED,
  MOUNTED,
  LOAD_ERROR,
  SKIP_BECAUSE_BROKEN,
  LOADING_SOURCE_CODE,
  shouldBeActive,
} from "./app.helpers.js";
import { reroute } from "../navigation/reroute.js";
import { find } from "../utils/find.js";
import { toUnmountPromise } from "../lifecycles/unmount.js";
import {
  toUnloadPromise,
  getAppUnloadInfo,
  addAppToUnload,
} from "../lifecycles/unload.js";
import { formatErrorMessage } from "./app-errors.js";
import { isInBrowser } from "../utils/runtime-environment.js";
import { assign } from "../utils/assign";

const apps = [];

export function getAppChanges() {
  const appsToUnload = [],
    appsToUnmount = [],
    appsToLoad = [],
    appsToMount = [];

  // We re-attempt to download applications in LOAD_ERROR after a timeout of 200 milliseconds
  const currentTime = new Date().getTime();

  apps.forEach((app) => {
    const appShouldBeActive =
      app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app);

    switch (app.status) {
      case LOAD_ERROR:
        if (appShouldBeActive && currentTime - app.loadErrorTime >= 200) {
          appsToLoad.push(app);
        }
        break;
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) {
          appsToLoad.push(app);
        }
        break;
      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        if (!appShouldBeActive && getAppUnloadInfo(toName(app))) {
          appsToUnload.push(app);
        } else if (appShouldBeActive) {
          appsToMount.push(app);
        }
        break;
      case MOUNTED:
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }
        break;
      // all other statuses are ignored
    }
  });

  return { appsToUnload, appsToUnmount, appsToLoad, appsToMount };
}

export function getMountedApps() {
  return apps.filter(isActive).map(toName);
}

export function getAppNames() {
  return apps.map(toName);
}

// used in devtools, not (currently) exposed as a single-spa API
export function getRawAppData() {
  return [...apps];
}

export function getAppStatus(appName) {
  const app = find(apps, (app) => toName(app) === appName);
  return app ? app.status : null;
}

export function registerApplication(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  const registration = sanitizeArguments(
    appNameOrConfig,
    appOrLoadApp,
    activeWhen,
    customProps
  );

  if (getAppNames().indexOf(registration.name) !== -1)
    throw Error(
      formatErrorMessage(
        21,
        __DEV__ &&
          `There is already an app registered with name ${registration.name}`,
        registration.name
      )
    );

  apps.push(
    assign(
      {
        loadErrorTime: null,
        status: NOT_LOADED,
        parcels: {},
        devtools: {
          overlays: {
            options: {},
            selectors: [],
          },
        },
      },
      registration
    )
  );

  if (isInBrowser) {
    ensureJQuerySupport();
    reroute();
  }
}

export function checkActivityFunctions(location = window.location) {
  return apps.filter((app) => app.activeWhen(location)).map(toName);
}

export function unregisterApplication(appName) {
  if (apps.filter((app) => toName(app) === appName).length === 0) {
    throw Error(
      formatErrorMessage(
        25,
        __DEV__ &&
          `Cannot unregister application '${appName}' because no such application has been registered`,
        appName
      )
    );
  }

  return unloadApplication(appName).then(() => {
    const appIndex = apps.map(toName).indexOf(appName);
    apps.splice(appIndex, 1);
  });
}

export function unloadApplication(appName, opts = { waitForUnmount: false }) {
  if (typeof appName !== "string") {
    throw Error(
      formatErrorMessage(
        26,
        __DEV__ && `unloadApplication requires a string 'appName'`
      )
    );
  }
  const app = find(apps, (App) => toName(App) === appName);
  if (!app) {
    throw Error(
      formatErrorMessage(
        27,
        __DEV__ &&
          `Could not unload application '${appName}' because no such application has been registered`,
        appName
      )
    );
  }

  const appUnloadInfo = getAppUnloadInfo(toName(app));
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
      resolve();
      setTimeout(() => {
        // reroute, but the unload promise is done
        reroute();
      });
    })
    .catch(reject);
}

function validateRegisterWithArguments(
  name,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  if (typeof name !== "string" || name.length === 0)
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          `The 1st argument to registerApplication must be a non-empty string 'appName'`
      )
    );

  if (!appOrLoadApp)
    throw Error(
      formatErrorMessage(
        23,
        __DEV__ &&
          "The 2nd argument to registerApplication must be an application or loading application function"
      )
    );

  if (typeof activeWhen !== "function")
    throw Error(
      formatErrorMessage(
        24,
        __DEV__ &&
          "The 3rd argument to registerApplication must be an activeWhen function"
      )
    );

  if (!validCustomProps(customProps))
    throw Error(
      formatErrorMessage(
        22,
        __DEV__ &&
          "The optional 4th argument is a customProps and must be an object"
      )
    );
}

export function validateRegisterWithConfig(config) {
  if (Array.isArray(config) || config === null)
    throw Error(
      formatErrorMessage(
        39,
        __DEV__ && "Configuration object can't be an Array or null!"
      )
    );
  const validKeys = ["name", "app", "activeWhen", "customProps"];
  const invalidKeys = Object.keys(config).reduce(
    (invalidKeys, prop) =>
      validKeys.indexOf(prop) >= 0 ? invalidKeys : invalidKeys.concat(prop),
    []
  );
  if (invalidKeys.length !== 0)
    throw Error(
      formatErrorMessage(
        38,
        __DEV__ &&
          `The configuration object accepts only: ${validKeys.join(
            ", "
          )}. Invalid keys: ${invalidKeys.join(", ")}.`,
        validKeys.join(", "),
        invalidKeys.join(", ")
      )
    );
  if (typeof config.name !== "string" || config.name.length === 0)
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          "The config.name on registerApplication must be a non-empty string"
      )
    );
  if (typeof config.app !== "object" && typeof config.app !== "function")
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          "The config.app on registerApplication must be an application or a loading function"
      )
    );
  const allowsStringAndFunction = (activeWhen) =>
    typeof activeWhen === "string" || typeof activeWhen === "function";
  if (
    !allowsStringAndFunction(config.activeWhen) &&
    !(
      Array.isArray(config.activeWhen) &&
      config.activeWhen.every(allowsStringAndFunction)
    )
  )
    throw Error(
      formatErrorMessage(
        24,
        __DEV__ &&
          "The config.activeWhen on registerApplication must be a string, function or an array with both"
      )
    );
  if (!validCustomProps(config.customProps))
    throw Error(
      formatErrorMessage(
        22,
        __DEV__ && "The optional config.customProps must be an object"
      )
    );
}

function validCustomProps(customProps) {
  return (
    !customProps ||
    typeof customProps === "function" ||
    (typeof customProps === "object" &&
      customProps !== null &&
      !Array.isArray(customProps))
  );
}

function sanitizeArguments(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  const usingObjectAPI = typeof appNameOrConfig === "object";

  const registration = {
    name: null,
    loadApp: null,
    activeWhen: null,
    customProps: null,
  };

  if (usingObjectAPI) {
    validateRegisterWithConfig(appNameOrConfig);
    registration.name = appNameOrConfig.name;
    registration.loadApp = appNameOrConfig.app;
    registration.activeWhen = appNameOrConfig.activeWhen;
    registration.customProps = appNameOrConfig.customProps;
  } else {
    validateRegisterWithArguments(
      appNameOrConfig,
      appOrLoadApp,
      activeWhen,
      customProps
    );
    registration.name = appNameOrConfig;
    registration.loadApp = appOrLoadApp;
    registration.activeWhen = activeWhen;
    registration.customProps = customProps;
  }

  registration.loadApp = sanitizeLoadApp(registration.loadApp);
  registration.customProps = sanitizeCustomProps(registration.customProps);
  registration.activeWhen = sanitizeActiveWhen(registration.activeWhen);

  return registration;
}

function sanitizeLoadApp(loadApp) {
  if (typeof loadApp !== "function") {
    return () => Promise.resolve(loadApp);
  }

  return loadApp;
}

function sanitizeCustomProps(customProps) {
  return customProps ? customProps : {};
}

function sanitizeActiveWhen(activeWhen) {
  let activeWhenArray = Array.isArray(activeWhen) ? activeWhen : [activeWhen];
  activeWhenArray = activeWhenArray.map((activeWhenOrPath) =>
    typeof activeWhenOrPath === "function"
      ? activeWhenOrPath
      : pathToActiveWhen(activeWhenOrPath)
  );

  return (location) =>
    activeWhenArray.some((activeWhen) => activeWhen(location));
}

export function pathToActiveWhen(path, exactMatch) {
  const regex = toDynamicPathValidatorRegex(path, exactMatch);

  return (location) => {
    const route = location.href
      .replace(location.origin, "")
      .replace(location.search, "")
      .split("?")[0];
    return regex.test(route);
  };
}

function toDynamicPathValidatorRegex(path, exactMatch) {
  let lastIndex = 0,
    inDynamic = false,
    regexStr = "^";

  if (path[0] !== "/") {
    path = "/" + path;
  }

  for (let charIndex = 0; charIndex < path.length; charIndex++) {
    const char = path[charIndex];
    const startOfDynamic = !inDynamic && char === ":";
    const endOfDynamic = inDynamic && char === "/";
    if (startOfDynamic || endOfDynamic) {
      appendToRegex(charIndex);
    }
  }

  appendToRegex(path.length);
  return new RegExp(regexStr, "i");

  function appendToRegex(index) {
    const anyCharMaybeTrailingSlashRegex = "[^/]+/?";
    const commonStringSubPath = escapeStrRegex(path.slice(lastIndex, index));

    regexStr += inDynamic
      ? anyCharMaybeTrailingSlashRegex
      : commonStringSubPath;

    if (index === path.length) {
      if (inDynamic) {
        if (exactMatch) {
          // Ensure paths that end in a dynamic portion don't match
          // urls with characters after a slash after the dynamic portion.
          regexStr += "$";
        }
      } else {
        // For exact matches, expect no more characters. Otherwise, allow
        // any characters.
        const suffix = exactMatch ? "" : ".*";

        regexStr =
          // use charAt instead as we could not use es6 method endsWith
          regexStr.charAt(regexStr.length - 1) === "/"
            ? `${regexStr}${suffix}$`
            : `${regexStr}(/${suffix})?(#.*)?$`;
      }
    }

    inDynamic = !inDynamic;
    lastIndex = index;
  }

  function escapeStrRegex(str) {
    // borrowed from https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
    return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
  }
}
