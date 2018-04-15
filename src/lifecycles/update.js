import { UPDATING, MOUNTED, SKIP_BECAUSE_BROKEN } from '../applications/app.helpers.js';
import { handleAppError, transformErr } from '../applications/app-errors.js';
import { reasonableTime } from '../applications/timeouts.js';
import { getProps } from './prop.helpers.js';

export function toUpdatePromise(appOrParcel) {
  return Promise.resolve().then(() => {
    const objectType = appOrParcel.isParcel ? 'parcel' : 'application';

    if (appOrParcel.status !== MOUNTED) {
      throw new Error(`Cannot update ${objectType} '${appOrParcel.name}' because it is not mounted`)
    }

    appOrParcel.status = UPDATING;

    return reasonableTime(appOrParcel.update(getProps(appOrParcel)), `Updating ${objectType} '${appOrParcel.name}'`, appOrParcel.timeouts.mount)
      .then(() => {
        appOrParcel.status = MOUNTED;
        return appOrParcel;
      })
      .catch(err => {
        const transformedErr = transformErr(err, appOrParcel)
        appOrParcel.status = SKIP_BECAUSE_BROKEN;
        throw transformedErr;
      })
  })
}

