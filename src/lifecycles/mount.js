import {
  NOT_MOUNTED,
  MOUNTED,
  SKIP_BECAUSE_BROKEN,
  MOUNTING,
  toName,
} from "../applications/app.helpers.js";
import { handleAppError, transformErr } from "../applications/app-errors.js";
import { reasonableTime } from "../applications/timeouts.js";
import CustomEvent from "custom-event";
import { toUnmountPromise } from "./unmount.js";
import { addProfileEntry } from "../devtools/profiler.js";

let beforeFirstMountFired = false;
let firstMountFired = false;

export function toMountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_MOUNTED) {
      return appOrParcel;
    }

    let startTime;

    if (__PROFILE__) {
      startTime = performance.now();
    }

    if (!beforeFirstMountFired) {
      window.dispatchEvent(new CustomEvent("single-spa:before-first-mount"));
      beforeFirstMountFired = true;
    }

    appOrParcel.status = MOUNTING;

    return reasonableTime(appOrParcel, "mount")
      .then(() => {
        appOrParcel.status = MOUNTED;

        if (!firstMountFired) {
          window.dispatchEvent(new CustomEvent("single-spa:first-mount"));
          firstMountFired = true;
        }

        if (__PROFILE__) {
          addProfileEntry(
            "application",
            toName(appOrParcel),
            "mount",
            startTime,
            performance.now(),
            true
          );
        }

        return appOrParcel;
      })
      .catch((err) => {
        // If we fail to mount the appOrParcel, we should attempt to unmount it before putting in SKIP_BECAUSE_BROKEN
        // We temporarily put the appOrParcel into MOUNTED status so that toUnmountPromise actually attempts to unmount it
        // instead of just doing a no-op.
        appOrParcel.status = MOUNTED;
        return toUnmountPromise(appOrParcel, true).then(
          setSkipBecauseBroken,
          setSkipBecauseBroken
        );

        function setSkipBecauseBroken() {
          if (__PROFILE__) {
            addProfileEntry(
              "application",
              toName(appOrParcel),
              "mount",
              startTime,
              performance.now(),
              false
            );
          }

          if (!hardFail) {
            handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
            return appOrParcel;
          } else {
            throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          }
        }
      });
  });
}
