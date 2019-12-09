import {
  UPDATING,
  MOUNTED,
  SKIP_BECAUSE_BROKEN
} from "../applications/app.helpers.js";
import {
  transformErr,
  formatErrorMessage
} from "../applications/app-errors.js";
import { reasonableTime } from "../applications/timeouts.js";

export function toUpdatePromise(parcel) {
  return Promise.resolve().then(() => {
    if (parcel.status !== MOUNTED) {
      throw Error(
        formatErrorMessage(
          32,
          __DEV__ &&
            `Cannot update parcel '${parcel.name}' because it is not mounted`,
          parcel.name
        )
      );
    }

    parcel.status = UPDATING;

    return reasonableTime(parcel, "update")
      .then(() => {
        parcel.status = MOUNTED;
        return parcel;
      })
      .catch(err => {
        const transformedErr = transformErr(err, parcel);
        parcel.status = SKIP_BECAUSE_BROKEN;
        throw transformedErr;
      });
  });
}
