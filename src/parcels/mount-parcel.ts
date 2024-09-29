import {
  validLifecycleFn,
  flattenFnArray,
  CustomProps,
  Parcel,
  ParcelCustomProps,
  ParcelConfigObject,
  ParcelConfig,
  ParcelOwner,
  InternalParcel,
} from "../lifecycles/lifecycle.helpers";
import {
  NOT_BOOTSTRAPPED,
  NOT_MOUNTED,
  MOUNTED,
  LOADING_SOURCE_CODE,
  SKIP_BECAUSE_BROKEN,
  toName,
} from "../applications/app.helpers";
import { toBootstrapPromise } from "../lifecycles/bootstrap";
import { toMountPromise } from "../lifecycles/mount";
import { toUpdatePromise } from "../lifecycles/update";
import { toUnmountPromise } from "../lifecycles/unmount";
import { ensureValidAppTimeouts } from "../applications/timeouts";
import { formatErrorMessage } from "../applications/app-errors";

let parcelCount: number = 0;
const rootParcels: ParcelOwner = { name: "rootParcels", parcels: {} };

// This is a public api, exported to users of single-spa
export function mountRootParcel(
  config: ParcelConfig,
  customProps: CustomProps,
) {
  return mountParcel.call(rootParcels, config, customProps);
}

export function mountParcel(
  this: ParcelOwner,
  config: ParcelConfig,
  customProps: ParcelCustomProps,
) {
  const owningAppOrParcel = this;

  // Validate inputs
  if (!config || (typeof config !== "object" && typeof config !== "function")) {
    throw Error(
      formatErrorMessage(
        2,
        __DEV__ &&
          "Cannot mount parcel without a config object or config loading function",
      ),
    );
  }

  if (config.name && typeof config.name !== "string") {
    throw Error(
      formatErrorMessage(
        3,
        __DEV__ &&
          `Parcel name must be a string, if provided. Was given ${typeof config.name}`,
        typeof config.name,
      ),
    );
  }

  const id = parcelCount++;
  let name = config.name || `parcel-${id}`;

  if (typeof customProps !== "object") {
    throw Error(
      formatErrorMessage(
        4,
        __DEV__ &&
          `Parcel ${name} has invalid customProps -- must be an object but was given ${typeof customProps}`,
        name,
        typeof customProps,
      ),
    );
  }

  if (!customProps.domElement) {
    throw Error(
      formatErrorMessage(
        5,
        __DEV__ &&
          `Parcel ${name} cannot be mounted without a domElement provided as a prop`,
        name,
      ),
    );
  }

  const passedConfigLoadingFunction = typeof config === "function";
  const configLoadingFunction: () => Promise<ParcelConfigObject<CustomProps>> =
    passedConfigLoadingFunction ? config : () => Promise.resolve(config);

  // Internal representation
  const parcel: Partial<InternalParcel> = {
    id,
    parcels: {},
    status: passedConfigLoadingFunction
      ? LOADING_SOURCE_CODE
      : NOT_BOOTSTRAPPED,
    customProps,
    parentName: toName(owningAppOrParcel),
    unmountThisParcel() {
      return mountPromise
        .then(() => {
          if (parcel.status !== MOUNTED) {
            throw Error(
              formatErrorMessage(
                6,
                __DEV__ &&
                  `Cannot unmount parcel '${name}' -- it is in a ${parcel.status} status`,
                name,
                parcel.status,
              ),
            );
          }
          return toUnmountPromise(parcel as InternalParcel, true);
        })
        .then((value) => {
          if (parcel.parentName) {
            delete owningAppOrParcel.parcels[parcel.id];
          }

          return value;
        })
        .then((value) => {
          resolveUnmount(value);
          return value;
        })
        .catch((err) => {
          parcel.status = SKIP_BECAUSE_BROKEN;
          rejectUnmount(err);
          throw err;
        });
    },
  };

  let loadPromise = configLoadingFunction();

  if (!loadPromise || typeof loadPromise.then !== "function") {
    throw Error(
      formatErrorMessage(
        7,
        __DEV__ &&
          `When mounting a parcel, the config loading function must return a promise that resolves with the parcel config`,
      ),
    );
  }

  loadPromise = loadPromise.then((config) => {
    if (!config) {
      throw Error(
        formatErrorMessage(
          8,
          __DEV__ &&
            `When mounting a parcel, the config loading function returned a promise that did not resolve with a parcel config`,
        ),
      );
    }

    name = config.name || `parcel-${id}`;

    if (
      // ES Module objects don't have the object prototype
      Object.prototype.hasOwnProperty.call(config, "bootstrap") &&
      !validLifecycleFn(config.bootstrap)
    ) {
      throw Error(
        formatErrorMessage(
          9,
          __DEV__ && `Parcel ${name} provided an invalid bootstrap function`,
          name,
        ),
      );
    }

    if (!validLifecycleFn(config.mount)) {
      throw Error(
        formatErrorMessage(
          10,
          __DEV__ && `Parcel ${name} must have a valid mount function`,
          name,
        ),
      );
    }

    if (!validLifecycleFn(config.unmount)) {
      throw Error(
        formatErrorMessage(
          11,
          __DEV__ && `Parcel ${name} must have a valid unmount function`,
          name,
        ),
      );
    }

    if (config.update && !validLifecycleFn(config.update)) {
      throw Error(
        formatErrorMessage(
          12,
          __DEV__ && `Parcel ${name} provided an invalid update function`,
          name,
        ),
      );
    }

    const bootstrap = flattenFnArray(config, "bootstrap", true);
    const mount = flattenFnArray(config, "mount", true);
    const unmount = flattenFnArray(config, "unmount", true);

    parcel.status = NOT_BOOTSTRAPPED;
    parcel.name = name;
    parcel.bootstrap = bootstrap;
    parcel.mount = mount;
    parcel.unmount = unmount;
    parcel.timeouts = ensureValidAppTimeouts(config.timeouts);

    if (config.update) {
      parcel.update = flattenFnArray(config, "update", true);
    }

    const fullParcel: InternalParcel = parcel as InternalParcel;

    // Add to owning app or parcel
    owningAppOrParcel.parcels[id] = fullParcel;

    return config;
  });

  // Start bootstrapping and mounting
  // The .then() causes the work to be put on the event loop instead of happening immediately
  const bootstrapPromise = loadPromise.then(() =>
    toBootstrapPromise(parcel as InternalParcel, true),
  );
  const mountPromise = bootstrapPromise.then(() =>
    toMountPromise(parcel as InternalParcel, true),
  );

  let resolveUnmount, rejectUnmount;

  const unmountPromise = new Promise((resolve, reject) => {
    resolveUnmount = resolve;
    rejectUnmount = reject;
  });

  let externalRepresentation: Parcel = {
    mount() {
      return promiseWithoutReturnValue(
        Promise.resolve().then(() => {
          if (parcel.status !== NOT_MOUNTED) {
            throw Error(
              formatErrorMessage(
                13,
                __DEV__ &&
                  `Cannot mount parcel '${name}' -- it is in a ${parcel.status} status`,
                name,
                parcel.status,
              ),
            );
          }

          // Add to owning app or parcel
          owningAppOrParcel.parcels[id] = parcel as InternalParcel;

          return toMountPromise(parcel as InternalParcel);
        }),
      );
    },
    unmount() {
      return promiseWithoutReturnValue(parcel.unmountThisParcel());
    },
    getStatus() {
      return parcel.status;
    },
    loadPromise: promiseWithoutReturnValue(loadPromise),
    bootstrapPromise: promiseWithoutReturnValue(bootstrapPromise),
    mountPromise: promiseWithoutReturnValue(mountPromise),
    unmountPromise: promiseWithoutReturnValue(unmountPromise),
    _parcel: parcel as InternalParcel,
  };

  loadPromise.then(
    (config) => {
      if (config.update) {
        externalRepresentation.update = function (customProps) {
          parcel.customProps = customProps;

          return promiseWithoutReturnValue(
            toUpdatePromise(parcel as InternalParcel),
          );
        };
      }
    },
    () => {
      // This catch handler avoids unhandled rejections.
      // User code can handle the rejection via externalRepresentation.loadPromise.catch
    },
  );

  return externalRepresentation;
}

function promiseWithoutReturnValue(promise) {
  return promise.then(() => null);
}
