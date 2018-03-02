import { NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../app.helpers.js';
import { handleAppError, transformErr } from '../app-errors.js';
import { reasonableTime } from '../timeouts.js';
import CustomEvent from 'custom-event';
import { getProps } from './prop.helpers.js';

let beforeFirstMountFired = false;
let firstMountFired = false;

export async function toMountPromise(appOrParcel, hardFail = false) {
  if (appOrParcel.status !== NOT_MOUNTED) {
    return appOrParcel;
  }

  if (!beforeFirstMountFired) {
    window.dispatchEvent(new CustomEvent('single-spa:before-first-mount'));
    beforeFirstMountFired = true;
  }

  try {
    await reasonableTime(appOrParcel.mount(getProps(appOrParcel)), `Mounting application '${appOrParcel.name}'`, appOrParcel.timeouts.mount);
    appOrParcel.status = MOUNTED;
  } catch (err) {
    if (!hardFail) {
      handleAppError(err, appOrParcel);
      appOrParcel.status = SKIP_BECAUSE_BROKEN;
    } else {
      const transformedErr = transformErr(err, appOrParcel)
      appOrParcel.status = SKIP_BECAUSE_BROKEN;
      throw transformedErr
    }
  }

  if (!firstMountFired) {
    window.dispatchEvent(new CustomEvent('single-spa:first-mount'));
    firstMountFired = true;
  }

  return appOrParcel;
}
