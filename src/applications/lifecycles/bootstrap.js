import { NOT_BOOTSTRAPPED, BOOTSTRAPPING, NOT_MOUNTED, SKIP_BECAUSE_BROKEN } from '../app.helpers.js';
import { reasonableTime } from '../timeouts.js';
import { handleAppError } from '../app-errors.js';
import { getProps } from './prop.helpers.js'

export async function toBootstrapPromise(appOrParcel, hardFail = false) {
  if (appOrParcel.status !== NOT_BOOTSTRAPPED) {
    return appOrParcel;
  }

  appOrParcel.status = BOOTSTRAPPING;

  try {
    await reasonableTime(appOrParcel.bootstrap(getProps(appOrParcel)), `Bootstrapping appOrParcel '${appOrParcel.name}'`, appOrParcel.timeouts.bootstrap);
    appOrParcel.status = NOT_MOUNTED;
  } catch(err) {
    appOrParcel.status = SKIP_BECAUSE_BROKEN;
    handleAppError(err, appOrParcel);
    if (hardFail) {
      throw err
    }
  }

  return appOrParcel;
}
