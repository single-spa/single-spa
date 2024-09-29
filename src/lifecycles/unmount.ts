import {
  UNMOUNTING,
  NOT_MOUNTED,
  MOUNTED,
  SKIP_BECAUSE_BROKEN,
  toName,
  isParcel,
} from "../applications/app.helpers";
import { handleAppError, transformErr } from "../applications/app-errors";
import { reasonableTime } from "../applications/timeouts";
import { ProfileEntry, addProfileEntry } from "../devtools/profiler";
import { LoadedAppOrParcel } from "./lifecycle.helpers";

export function toUnmountPromise(
  appOrParcel: LoadedAppOrParcel,
  hardFail?: boolean,
): Promise<LoadedAppOrParcel> {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== MOUNTED) {
      return appOrParcel;
    }

    let startTime: number, profileEventType: ProfileEntry["type"];

    if (__PROFILE__) {
      startTime = performance.now();
      profileEventType = isParcel(appOrParcel) ? "parcel" : "application";
    }

    appOrParcel.status = UNMOUNTING;

    const unmountChildrenParcels = Object.keys(appOrParcel.parcels).map(
      (parcelId) => appOrParcel.parcels[parcelId].unmountThisParcel(),
    );

    let parcelError: Error;

    return Promise.all(unmountChildrenParcels)
      .then(unmountAppOrParcel, (parcelError) => {
        // There is a parcel unmount error
        return unmountAppOrParcel().then(() => {
          // Unmounting the app/parcel succeeded, but unmounting its children parcels did not
          const parentError = Error(parcelError.message);
          if (hardFail) {
            throw transformErr(parentError, appOrParcel, SKIP_BECAUSE_BROKEN);
          } else {
            handleAppError(parentError, appOrParcel, SKIP_BECAUSE_BROKEN);
          }
        });
      })
      .then(() => appOrParcel);

    function unmountAppOrParcel() {
      // We always try to unmount the appOrParcel, even if the children parcels failed to unmount.
      return reasonableTime(appOrParcel, "unmount").then(
        () => {
          // The appOrParcel needs to stay in a broken status if its children parcels fail to unmount
          if (!parcelError) {
            appOrParcel.status = NOT_MOUNTED;
          }

          if (__PROFILE__) {
            addProfileEntry(
              profileEventType,
              toName(appOrParcel),
              "unmount",
              startTime,
              performance.now(),
              true,
            );
          }
        },
        (err) => {
          if (__PROFILE__) {
            addProfileEntry(
              profileEventType,
              toName(appOrParcel),
              "unmount",
              startTime,
              performance.now(),
              false,
            );
          }

          if (hardFail) {
            throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          } else {
            handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          }
        },
      );
    }
  });
}
