import {
  NOT_BOOTSTRAPPED,
  BOOTSTRAPPING,
  NOT_MOUNTED,
  SKIP_BECAUSE_BROKEN,
  toName,
} from "../applications/app.helpers.js";
import { reasonableTime } from "../applications/timeouts.js";
import { handleAppError, transformErr } from "../applications/app-errors.js";
import { addProfileEntry } from "../devtools/profiler.js";

export function toBootstrapPromise(appOrParcel, hardFail) {
  let startTime;

  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_BOOTSTRAPPED) {
      return appOrParcel;
    }

    if (__PROFILE__) {
      startTime = Date.now();
    }

    appOrParcel.status = BOOTSTRAPPING;

    if (!appOrParcel.bootstrap) {
      // Default implementation of bootstrap
      return Promise.resolve().then(successfulBootstrap);
    }

    return reasonableTime(appOrParcel, "bootstrap")
      .then(successfulBootstrap)
      .catch((err) => {
        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(appOrParcel),
            "bootstrap",
            startTime,
            Date.now(),
            false
          );
        }

        if (hardFail) {
          throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
        } else {
          handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          return appOrParcel;
        }
      });
  });

  function successfulBootstrap() {
    appOrParcel.status = NOT_MOUNTED;

    if (__PROFILE__) {
      addProfileEntry(
        "application",
        toName(appOrParcel),
        "bootstrap",
        startTime,
        Date.now(),
        true
      );
    }

    return appOrParcel;
  }
}
