import { validLifecycleFn, flattenFnArray } from 'src/applications/lifecycles/lifecycle.helpers.js';
import { NOT_BOOTSTRAPPED, NOT_MOUNTED, MOUNTED } from 'src/applications/app.helpers.js';
import { toBootstrapPromise } from 'src/applications/lifecycles/bootstrap.js';
import { toMountPromise } from 'src/applications/lifecycles/mount.js';
import { toUnmountPromise } from 'src/applications/lifecycles/unmount.js';
import { ensureValidAppTimeouts } from 'src/applications/timeouts.js';

let parcelCount = 0;
const rootParcels = {parcels: {}};

// This is a public api, exported to users of single-spa
export function mountRootParcel() {
  return mountParcel.apply(rootParcels, arguments);
}

export function mountParcel(config, customProps) {
  const owningAppOrParcel = this;

  // Validate inputs
  if (!config || typeof config !== 'object') {
    throw new Error('Cannot mount parcel without config object');
  }

  if (config.name && typeof config.name !== 'string') {
    throw new Error('Parcel name must be a string, if provided');
  }

  const id = parcelCount++;
  const name = config.name || `parcel-${id}`;

  if (!validLifecycleFn(config.bootstrap)) {
    throw new Error(`Parcel ${name} must have a valid bootstrap function`);
  }

  if (!validLifecycleFn(config.mount)) {
    throw new Error(`Parcel ${name} must have a valid mount function`);
  }

  if (!validLifecycleFn(config.unmount)) {
    throw new Error(`Parcel ${name} must have a valid unmount function`);
  }

  if (typeof customProps !== 'object') {
    throw new Error(`Parcel ${name} has invalid customProps -- must be an object`);
  }

  if (!customProps.domElement) {
    throw new Error(`Parcel ${name} cannot be mounted without a domElement provided as a prop`);
  }

  const bootstrap = flattenFnArray(config.bootstrap);
  const mount = flattenFnArray(config.mount);
  const unmount = flattenFnArray(config.unmount);

  // Internal representation
  const parcel = {
    id,
    bootstrap,
    mount,
    unmount,
    name,
    parcels: {},
    status: NOT_BOOTSTRAPPED,
    customProps,
    owningAppOrParcel,
    timeouts: ensureValidAppTimeouts(parcel),
    unmountThisParcel() {
      if (parcel.status !== MOUNTED) {
        throw new Error(`Cannot unmount parcel '${name}' -- it is in a ${parcel.status} status`);
      }

      return toUnmountPromise(parcel)
        .then(value => {
          if (parcel.owningAppOrParcel) {
            delete parcel.owningAppOrParcel.parcels[parcel.id];
          }

          return value;
        })
        .then(value => {
          resolveUnmount(value);
          return value;
        })
        .catch(err => {
          rejectUnmount(err);
          throw err;
        });
    }
  };

  // Add to owning app or parcel
  owningAppOrParcel.parcels[id] = parcel;

  // Start bootstrapping and mounting
  // The .then() causes the work to be put on the event loop instead of happening immediately
  const bootstrapPromise = Promise.resolve().then(() => toBootstrapPromise(parcel));
  const mountPromise = bootstrapPromise.then(() => toMountPromise(parcel));

  let resolveUnmount, rejectUnmount;

  const unmountPromise = new Promise((resolve, reject) => {
    resolveUnmount = resolve;
    rejectUnmount = reject;
  });

  // Return external representation
  return {
    mount() {
      return promiseWithoutReturnValue(
        Promise
        .resolve()
        .then(() => {
          if (parcel.status !== NOT_MOUNTED) {
            throw new Error(`Cannot mount parcel '${name}' -- it is in a ${parcel.status} status`);
          }

          // Add to owning app or parcel
          owningAppOrParcel.parcels[id] = parcel;

          return toMountPromise(parcel);
        })
      )
    },
    unmount() {
      return promiseWithoutReturnValue(
        parcel.unmountThisParcel()
      );
    },
    getStatus() {
      return parcel.status;
    },
    bootstrapPromise: promiseWithoutReturnValue(bootstrapPromise),
    mountPromise: promiseWithoutReturnValue(mountPromise),
    unmountPromise: promiseWithoutReturnValue(unmountPromise),
  };
}

function promiseWithoutReturnValue(promise) {
  return promise.then(() => null);
}
