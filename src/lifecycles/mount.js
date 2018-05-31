import { NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../applications/app.helpers.js';
import { handleAppError, transformErr } from '../applications/app-errors.js';
import { reasonableTime } from '../applications/timeouts.js';
import CustomEvent from 'custom-event';
import { getProps } from './prop.helpers.js';

let beforeFirstMountFired = false;
let firstMountFired = false;

export function toMountPromise(appOrParcel, hardFail = false) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_MOUNTED) {
      return appOrParcel;
    }

    if (!beforeFirstMountFired) {
      window.dispatchEvent(new CustomEvent('single-spa:before-first-mount'));
      beforeFirstMountFired = true;
    }

    return reasonableTime(appOrParcel.mount(getProps(appOrParcel)), `Mounting application '${appOrParcel.name}'`, appOrParcel.timeouts.mount)
      .then(() => {
        appOrParcel.status = MOUNTED;

        if (!firstMountFired) {
          window.dispatchEvent(new CustomEvent('single-spa:first-mount'));
          firstMountFired = true;
        }

        return appOrParcel;
      })
      .catch(err => {
        if (!hardFail) {
          handleAppError(err, appOrParcel);
          appOrParcel.status = SKIP_BECAUSE_BROKEN;
          return appOrParcel;
        } else {
          const transformedErr = transformErr(err, appOrParcel)
          appOrParcel.status = SKIP_BECAUSE_BROKEN;
          throw transformedErr
        }
      })
  })
}
