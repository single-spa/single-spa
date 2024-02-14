import {
  UPDATING,
  MOUNTED,
  SKIP_BECAUSE_BROKEN,
  toName,
  isParcel,
} from "../applications/app.helpers";
import { transformErr, formatErrorMessage } from "../applications/app-errors";
import { reasonableTime } from "../applications/timeouts";
import { addProfileEntry } from "../devtools/profiler";

export function toUpdatePromise(appOrParcel) {
  return Promise.resolve().then(() => {
    let startTime, profileEventType;

    if (__PROFILE__) {
      profileEventType = isParcel(appOrParcel) ? "parcel" : "application";
      startTime = performance.now();
    }

    if (appOrParcel.status !== MOUNTED) {
      throw Error(
        formatErrorMessage(
          32,
          __DEV__ &&
            `Cannot update parcel '${toName(
              appOrParcel
            )}' because it is not mounted`,
          toName(appOrParcel)
        )
      );
    }

    appOrParcel.status = UPDATING;

    return reasonableTime(appOrParcel, "update")
      .then(() => {
        appOrParcel.status = MOUNTED;

        if (__PROFILE__) {
          addProfileEntry(
            profileEventType,
            toName(appOrParcel),
            "update",
            startTime,
            performance.now(),
            true
          );
        }

        return appOrParcel;
      })
      .catch((err) => {
        if (__PROFILE__) {
          addProfileEntry(
            profileEventType,
            toName(appOrParcel),
            "update",
            startTime,
            performance.now(),
            false
          );
        }

        throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
      });
  });
}
