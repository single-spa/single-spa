import { UPDATING, MOUNTED, SKIP_BECAUSE_BROKEN } from '../applications/app.helpers.js';
import { handleAppError, transformErr } from '../applications/app-errors.js';
import { reasonableTime } from '../applications/timeouts.js';
import { getProps } from './prop.helpers.js';

export function toUpdatePromise(parcel) {
  return Promise.resolve().then(() => {
    if (parcel.status !== MOUNTED) {
      throw new Error(`Cannot update parcel '${parcel.name}' because it is not mounted`)
    }

    parcel.status = UPDATING;

    return reasonableTime(parcel.update(getProps(parcel)), `Updating parcel '${parcel.name}'`, parcel.timeouts.mount)
      .then(() => {
        parcel.status = MOUNTED;
        return parcel;
      })
      .catch(err => {
        const transformedErr = transformErr(err, parcel)
        parcel.status = SKIP_BECAUSE_BROKEN;
        throw transformedErr;
      })
  })
}

