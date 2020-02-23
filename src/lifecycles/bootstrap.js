import {
  NOT_BOOTSTRAPPED,
  BOOTSTRAPPING,
  NOT_MOUNTED,
  SKIP_BECAUSE_BROKEN
} from "../applications/app.helpers.js";
import { reasonableTime } from "../applications/timeouts.js";
import { handleAppError, transformErr } from "../applications/app-errors.js";

export function toBootstrapPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_BOOTSTRAPPED) {
      return appOrParcel;
    }

    appOrParcel.status = BOOTSTRAPPING;

    return reasonableTime(appOrParcel, "bootstrap")
      .then(() => {
        appOrParcel.status = NOT_MOUNTED;
        return appOrParcel;
      })
      .catch(err => {
        appOrParcel.status = SKIP_BECAUSE_BROKEN;
        if (hardFail) {
          throw transformErr(err, appOrParcel);
        } else {
          handleAppError(err, appOrParcel);
          return appOrParcel;
        }
      });
  });
}
