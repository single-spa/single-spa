const globalTimeoutConfig = {
  bootstrap: {
    millis: 4000,
    dieOnTimeout: false,
    warningMillis: 1000,
  },
  mount: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: 1000,
  },
  unmount: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: 1000,
  },
  unload: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: 1000,
  },
};

export function setBootstrapMaxTime(time, dieOnTimeout = false, warningMillis = 1000) {
  if (typeof time !== 'number' || time <= 0) {
    throw Error(`bootstrap max time must be a positive integer number of milliseconds`);
  }

  globalTimeoutConfig.bootstrap = {
    millis: time,
    dieOnTimeout,
    warningMillis,
  };
}

export function setMountMaxTime(time, dieOnTimeout = false, warningMillis = 1000) {
  if (typeof time !== 'number' || time <= 0) {
    throw Error(`mount max time must be a positive integer number of milliseconds`);
  }

  globalTimeoutConfig.mount = {
    millis: time,
    dieOnTimeout,
    warningMillis,
  };
}

export function setUnmountMaxTime(time, dieOnTimeout = false, warningMillis = 1000) {
  if (typeof time !== 'number' || time <= 0) {
    throw Error(`unmount max time must be a positive integer number of milliseconds`);
  }

  globalTimeoutConfig.unmount = {
    millis: time,
    dieOnTimeout,
    warningMillis,
  };
}

export function setUnloadMaxTime(time, dieOnTimeout = false, warningMillis = 1000) {
  if (typeof time !== 'number' || time <= 0) {
    throw Error(`unload max time must be a positive integer number of milliseconds`);
  }

  globalTimeoutConfig.unload = {
    millis: time,
    dieOnTimeout,
    warningMillis,
  };
}

export function reasonableTime(promise, description, timeoutConfig) {
  const warningPeriod = timeoutConfig.warningMillis;

  return new Promise((resolve, reject) => {
    let finished = false;
    let errored = false;

    promise
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

    function maybeTimingOut(shouldError) {
      if (!finished) {
        if (shouldError === true) {
          errored = true;
          if (timeoutConfig.dieOnTimeout) {
            reject(Error(`${description} did not resolve or reject for ${timeoutConfig.millis} milliseconds`));
          } else {
            console.error(`${description} did not resolve or reject for ${timeoutConfig.millis} milliseconds -- we're no longer going to warn you about it.`);
            //don't resolve or reject, we're waiting this one out
          }
        } else if (!errored) {
          const numWarnings = shouldError;
          const numMillis = numWarnings * warningPeriod;
          console.warn(`${description} did not resolve or reject within ${numMillis} milliseconds`);
          if (numMillis + warningPeriod < timeoutConfig.millis) {
            setTimeout(() => maybeTimingOut(numWarnings + 1), warningPeriod);
          }
        }
      }
    }
  });
}

export function ensureValidAppTimeouts(timeouts) {
  const result = {};

  for (let key in globalTimeoutConfig) {
    result[key] = {
      ...globalTimeoutConfig[key],
      ...(timeouts && typeof timeouts[key] === 'object' ? timeouts[key] : {}),
    }
  }

  return result;
}
