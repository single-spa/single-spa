import {
  validLifecycleFn,
  flattenFnArray
} from "../lifecycles/lifecycle.helpers.js";
import {
  NOT_BOOTSTRAPPED,
  NOT_MOUNTED,
  MOUNTED,
  LOADING_SOURCE_CODE,
  SKIP_BECAUSE_BROKEN
} from "../applications/app.helpers.js";
import { toBootstrapPromise } from "../lifecycles/bootstrap.js";
import { toMountPromise } from "../lifecycles/mount.js";
import { toUpdatePromise } from "../lifecycles/update.js";
import { toUnmountPromise } from "../lifecycles/unmount.js";
import { ensureValidAppTimeouts } from "../applications/timeouts.js";
import {
  devErrorMessage,
  prodErrorMessage
} from "../applications/app-errors.js";

let parcelCount = 0;
const rootParcels = { parcels: {} };

// This is a public api, exported to users of single-spa
export function mountRootParcel() {
  return mountParcel.apply(rootParcels, arguments);
}

export function mountParcel(config, customProps) {
  const owningAppOrParcel = this;

  // Validate inputs
  if (!config || (typeof config !== "object" && typeof config !== "function")) {
    throw Error(
      __DEV__
        ? devErrorMessage(
            2,
            "Cannot mount parcel without a config object or config loading function"
          )
        : prodErrorMessage(2)
    );
  }

  if (config.name && typeof config.name !== "string") {
    throw Error(
      __DEV__
        ? devErrorMessage(3, "Parcel name must be a string, if provided")
        : prodErrorMessage(3)
    );
  }

  if (typeof customProps !== "object") {
    throw Error(
      __DEV__
        ? devErrorMessage(
            4,
            `Parcel ${name} has invalid customProps -- must be an object`,
            name
          )
        : prodErrorMessage(4, name)
    );
  }

  if (!customProps.domElement) {
    throw Error(
      __DEV__
        ? devErrorMessage(
            5,
            `Parcel ${name} cannot be mounted without a domElement provided as a prop`,
            name
          )
        : prodErrorMessage(5, name)
    );
  }

  const id = parcelCount++;

  const passedConfigLoadingFunction = typeof config === "function";
  const configLoadingFunction = passedConfigLoadingFunction
    ? config
    : () => Promise.resolve(config);

  // Internal representation
  const parcel = {
    id,
    parcels: {},
    status: passedConfigLoadingFunction
      ? LOADING_SOURCE_CODE
      : NOT_BOOTSTRAPPED,
    customProps,
    parentName: owningAppOrParcel.name,
    unmountThisParcel() {
      if (parcel.status !== MOUNTED) {
        throw Error(
          __DEV__
            ? devErrorMessage(
                6,
                `Cannot unmount parcel '${name}' -- it is in a ${parcel.status} status`,
                name,
                parcel.status
              )
            : prodErrorMessage(6, name, parcel.status)
        );
      }

      return toUnmountPromise(parcel, true)
        .then(value => {
          if (parcel.parentName) {
            delete owningAppOrParcel.parcels[parcel.id];
          }

          return value;
        })
        .then(value => {
          resolveUnmount(value);
          return value;
        })
        .catch(err => {
          parcel.status = SKIP_BECAUSE_BROKEN;
          rejectUnmount(err);
          throw err;
        });
    }
  };

  // We return an external representation
  let externalRepresentation;

  // Add to owning app or parcel
  owningAppOrParcel.parcels[id] = parcel;

  let loadPromise = configLoadingFunction();

  if (!loadPromise || typeof loadPromise.then !== "function") {
    throw Error(
      __DEV__
        ? devErrorMessage(
            7,
            `When mounting a parcel, the config loading function must return a promise that resolves with the parcel config`
          )
        : prodErrorMessage(7)
    );
  }

  loadPromise = loadPromise.then(config => {
    if (!config) {
      throw Error(
        __DEV__
          ? devErrorMessage(
              8,
              `When mounting a parcel, the config loading function returned a promise that did not resolve with a parcel config`
            )
          : prodErrorMessage(8)
      );
    }

    const name = config.name || `parcel-${id}`;

    if (!validLifecycleFn(config.bootstrap)) {
      throw Error(
        __DEV__
          ? devErrorMessage(
              9,
              `Parcel ${name} must have a valid bootstrap function`,
              name
            )
          : prodErrorMessage(9, name)
      );
    }

    if (!validLifecycleFn(config.mount)) {
      throw Error(
        __DEV__
          ? devErrorMessage(
              10,
              `Parcel ${name} must have a valid mount function`,
              name
            )
          : prodErrorMessage(10, name)
      );
    }

    if (!validLifecycleFn(config.unmount)) {
      throw Error(
        __DEV__
          ? devErrorMessage(
              11,
              `Parcel ${name} must have a valid unmount function`,
              name
            )
          : prodErrorMessage(11, name)
      );
    }

    if (config.update && !validLifecycleFn(config.update)) {
      throw Error(
        __DEV__
          ? devErrorMessage(
              12,
              `Parcel ${name} provided an invalid update function`
            )
          : prodErrorMessage(12)
      );
    }

    const bootstrap = flattenFnArray(config, "bootstrap");
    const mount = flattenFnArray(config, "mount");
    const unmount = flattenFnArray(config, "unmount");

    parcel.status = NOT_BOOTSTRAPPED;
    parcel.name = name;
    parcel.bootstrap = bootstrap;
    parcel.mount = mount;
    parcel.unmount = unmount;
    parcel.timeouts = ensureValidAppTimeouts(config.timeouts);

    if (config.update) {
      parcel.update = flattenFnArray(config, "update");
      externalRepresentation.update = function(customProps) {
        parcel.customProps = customProps;

        return promiseWithoutReturnValue(toUpdatePromise(parcel));
      };
    }
  });

  // Start bootstrapping and mounting
  // The .then() causes the work to be put on the event loop instead of happening immediately
  const bootstrapPromise = loadPromise.then(() =>
    toBootstrapPromise(parcel, true)
  );
  const mountPromise = bootstrapPromise.then(() =>
    toMountPromise(parcel, true)
  );

  let resolveUnmount, rejectUnmount;

  const unmountPromise = new Promise((resolve, reject) => {
    resolveUnmount = resolve;
    rejectUnmount = reject;
  });

  externalRepresentation = {
    mount() {
      return promiseWithoutReturnValue(
        Promise.resolve().then(() => {
          if (parcel.status !== NOT_MOUNTED) {
            throw Error(
              __DEV__
                ? devErrorMessage(
                    13,
                    `Cannot mount parcel '${name}' -- it is in a ${parcel.status} status`,
                    name,
                    parcel.status
                  )
                : prodErrorMessage(13, name, parcel.status)
            );
          }

          // Add to owning app or parcel
          owningAppOrParcel.parcels[id] = parcel;

          return toMountPromise(parcel);
        })
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
    unmountPromise: promiseWithoutReturnValue(unmountPromise)
  };

  return externalRepresentation;
}

function promiseWithoutReturnValue(promise) {
  return promise.then(() => null);
}
