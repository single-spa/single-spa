import { devErrorMessage, prodErrorMessage } from "./app-errors";
import { getProps } from "../lifecycles/prop.helpers";
import { objectType, toName } from "./app.helpers";

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
      __DEV__
        ? devErrorMessage(
            16,
            `bootstrap max time must be a positive integer number of milliseconds`
          )
        : prodErrorMessage(16)
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
      __DEV__
        ? devErrorMessage(
            17,
            `mount max time must be a positive integer number of milliseconds`
          )
        : prodErrorMessage(17)
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
      __DEV__
        ? devErrorMessage(
            18,
            `unmount max time must be a positive integer number of milliseconds`
          )
        : prodErrorMessage(18)
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
      __DEV__
        ? devErrorMessage(
            19,
            `unload max time must be a positive integer number of milliseconds`
          )
        : prodErrorMessage(19)
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

    const errMsg = __DEV__
      ? devErrorMessage(
          31,
          `Lifecycle function ${lifecycle} for ${type} ${toName(
            appOrParcel
          )} lifecycle did not resolve or reject for ${timeoutConfig.millis}`
        )
      : prodErrorMessage(
          31,
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
            reject(Error());
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

export function ensureValidAppTimeouts(timeouts = {}) {
  return {
    ...globalTimeoutConfig,
    ...timeouts
  };
}
