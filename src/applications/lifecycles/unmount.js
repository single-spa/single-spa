import { UNMOUNTING, NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../app.helpers.js';
import { handleAppError } from '../app-errors.js';
import { reasonableTime } from '../timeouts.js';
import { getProps } from './prop.helpers.js';

export async function toUnmountPromise(appOrParcel) {
  if (appOrParcel.status !== MOUNTED) {
    return appOrParcel;
  }
  appOrParcel.status = UNMOUNTING;

  const unmountChildrenParcels = Object.keys(appOrParcel.parcels)
    .map(parcelId => appOrParcel.parcels[parcelId].unmountThisParcel());

  try {
    await Promise.all(unmountChildrenParcels);
    await reasonableTime(appOrParcel.unmount(getProps(appOrParcel)), `Unmounting application ${appOrParcel.name}'`, appOrParcel.timeouts.unmount);
    appOrParcel.status = NOT_MOUNTED;
  } catch (err) {
    handleAppError(err, appOrParcel);
    appOrParcel.status = SKIP_BECAUSE_BROKEN;
  }

  return appOrParcel;
}
