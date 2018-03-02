import { UNMOUNTING, NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../app.helpers.js';
import { handleAppError, transformErr } from '../app-errors.js';
import { reasonableTime } from '../timeouts.js';
import { getProps } from './prop.helpers.js';

export async function toUnmountPromise(appOrParcel, hardFail = false) {
  if (appOrParcel.status !== MOUNTED) {
    return appOrParcel;
  }
  appOrParcel.status = UNMOUNTING;

  const unmountChildrenParcels = Object.keys(appOrParcel.parcels)
    .map(parcelId => appOrParcel.parcels[parcelId].unmountThisParcel());

  let parcelError;

  try {
    await Promise.all(unmountChildrenParcels);
  } catch (err) {
    parcelError = err;
    const parentError = new Error(parcelError.message)
    if (hardFail) {
      const transformedErr = transformErr(parentError, appOrParcel)
      appOrParcel.status = SKIP_BECAUSE_BROKEN;
      throw transformedErr
    } else {
      handleAppError(parentError, appOrParcel);
      appOrParcel.status = SKIP_BECAUSE_BROKEN;
    }
  } finally {
    // We always try to unmount the appOrParcel, even if the children parcels failed to unmount.
    try {
      await reasonableTime(appOrParcel.unmount(getProps(appOrParcel)), `Unmounting application ${appOrParcel.name}'`, appOrParcel.timeouts.unmount);

      // The appOrParcel needs to stay in a broken status if its children parcels fail to unmount
      if (!parcelError) {
        appOrParcel.status = NOT_MOUNTED;
      }
    } catch (err) {
      if (hardFail) {
        const transformedErr = transformErr(err, appOrParcel)
        appOrParcel.status = SKIP_BECAUSE_BROKEN;
        throw transformedErr
      } else {
        handleAppError(err, appOrParcel);
        appOrParcel.status = SKIP_BECAUSE_BROKEN;
      }
    }
  }

  return appOrParcel;
}
