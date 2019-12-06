import {
  UPDATING,
  MOUNTED,
  SKIP_BECAUSE_BROKEN
} from "../applications/app.helpers.js";
import {
  transformErr,
  devErrorMessage,
  prodErrorMessage
} from "../applications/app-errors.js";
import { reasonableTime } from "../applications/timeouts.js";

export function toUpdatePromise(parcel) {
  return Promise.resolve().then(() => {
    if (parcel.status !== MOUNTED) {
      throw Error(
        __DEV__
          ? devErrorMessage(
              32,
              `Cannot update parcel '${parcel.name}' because it is not mounted`,
              parcel.name
            )
          : prodErrorMessage(32, parcel.name)
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
