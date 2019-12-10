import { assign } from "../utils/assign";
import { getProps } from "../lifecycles/prop.helpers";
import { objectType, toName } from "./app.helpers";
import { formatErrorMessage } from "./app-errors";

const globalTimeoutConfig = {
  bootstrap: {
    millis: 4000,
    dieOnTimeout: false
  },
  mount: {
    millis: 3000,
    dieOnTimeout: false
  },
  unmount: {
    millis: 3000,
    dieOnTimeout: false
  },
  unload: {
    millis: 3000,
    dieOnTimeout: false
  },
  update: {
    millis: 3000,
    dieOnTimeout: false
  }
};

export function setBootstrapMaxTime(time, dieOnTimeout) {
  if (typeof time !== "number" || time <= 0) {
    throw Error(
      formatErrorMessage(
        16,
        __DEV__ &&
          `bootstrap max time must be a positive integer number of milliseconds`
      )
    );
  }

  globalTimeoutConfig.bootstrap = {
    millis: time,
    dieOnTimeout
  };
}

export function setMountMaxTime(time, dieOnTimeout) {
  if (typeof time !== "number" || time <= 0) {
    throw Error(
      formatErrorMessage(
        17,
        __DEV__ &&
          `mount max time must be a positive integer number of milliseconds`
      )
    );
  }

  globalTimeoutConfig.mount = {
    millis: time,
    dieOnTimeout
  };
}

export function setUnmountMaxTime(time, dieOnTimeout) {
  if (typeof time !== "number" || time <= 0) {
    throw Error(
      formatErrorMessage(
        18,
        __DEV__ &&
          `unmount max time must be a positive integer number of milliseconds`
      )
    );
  }

  globalTimeoutConfig.unmount = {
    millis: time,
    dieOnTimeout
  };
}

export function setUnloadMaxTime(time, dieOnTimeout) {
  if (typeof time !== "number" || time <= 0) {
    throw Error(
      formatErrorMessage(
        19,
        __DEV__ &&
          `unload max time must be a positive integer number of milliseconds`
      )
    );
  }

  globalTimeoutConfig.unload = {
    millis: time,
    dieOnTimeout
  };
}

export function reasonableTime(appOrParcel, lifecycle) {
  const warningPeriod = 1000;
  const timeoutConfig = appOrParcel.timeouts[lifecycle];
  const type = objectType(appOrParcel);

  return new Promise((resolve, reject) => {
    let finished = false;
    let errored = false;

    appOrParcel[lifecycle](getProps(appOrParcel))
      .then(val => {
        finished = true;
        resolve(val);
      })
      .catch(val => {
        finished = true;
        reject(val);
      });

    setTimeout(() => maybeTimingOut(1), warningPeriod);
    setTimeout(() => maybeTimingOut(true), timeoutConfig.millis);

    const errMsg = formatErrorMessage(
      31,
      __DEV__ &&
        `Lifecycle function ${lifecycle} for ${type} ${toName(
          appOrParcel
        )} lifecycle did not resolve or reject for ${timeoutConfig.millis}`,
      lifecycle,
      type,
      toName(appOrParcel),
      timeoutConfig.millis
    );

    function maybeTimingOut(shouldError) {
      if (!finished) {
        if (shouldError === true) {
          errored = true;
          if (timeoutConfig.dieOnTimeout) {
            reject(Error(errMsg));
          } else {
            console.error(errMsg);
            //don't resolve or reject, we're waiting this one out
          }
        } else if (!errored) {
          const numWarnings = shouldError;
          const numMillis = numWarnings * warningPeriod;
          console.warn(errMsg);
          if (numMillis + warningPeriod < timeoutConfig.millis) {
            setTimeout(() => maybeTimingOut(numWarnings + 1), warningPeriod);
          }
        }
      }
    }
  });
}

export function ensureValidAppTimeouts(timeouts) {
  return assign({}, globalTimeoutConfig, timeouts || {});
}
