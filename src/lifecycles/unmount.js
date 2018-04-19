import { UNMOUNTING, NOT_MOUNTED, MOUNTED, SKIP_BECAUSE_BROKEN } from '../applications/app.helpers.js';
import { handleAppError, transformErr } from '../applications/app-errors.js';
import { reasonableTime } from '../applications/timeouts.js';
import { getProps } from './prop.helpers.js';

export function toUnmountPromise(appOrParcel, hardFail = false) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== MOUNTED) {
      return appOrParcel;
    }
    appOrParcel.status = UNMOUNTING;

    const unmountChildrenParcels = Object.keys(appOrParcel.parcels)
      .map(parcelId => appOrParcel.parcels[parcelId].unmountThisParcel());

    let parcelError;

    return Promise.all(unmountChildrenParcels)
      .then(
        unmountAppOrParcel,
        parcelError => {
          // There is a parcel unmount error
          return unmountAppOrParcel()
            .then(() => {
              // Unmounting the app/parcel succeeded, but unmounting its children parcels did not
              const parentError = new Error(parcelError.message)
              if (hardFail) {
                const transformedErr = transformErr(parentError, appOrParcel)
                appOrParcel.status = SKIP_BECAUSE_BROKEN;
                throw transformedErr
              } else {
                handleAppError(parentError, appOrParcel);
                appOrParcel.status = SKIP_BECAUSE_BROKEN;
              }
            })
        }
      )
      .then(() => appOrParcel)

    function unmountAppOrParcel() {
      // We always try to unmount the appOrParcel, even if the children parcels failed to unmount.
      return reasonableTime(appOrParcel.unmount(getProps(appOrParcel)), `Unmounting application ${appOrParcel.name}'`, appOrParcel.timeouts.unmount)
        .then(() => {
          // The appOrParcel needs to stay in a broken status if its children parcels fail to unmount
          if (!parcelError) {
            appOrParcel.status = NOT_MOUNTED;
          }
        })
        .catch(err => {
          if (hardFail) {
            const transformedErr = transformErr(err, appOrParcel);
            appOrParcel.status = SKIP_BECAUSE_BROKEN;
            throw transformedErr;
          } else {
            handleAppError(err, appOrParcel);
            appOrParcel.status = SKIP_BECAUSE_BROKEN;
          }
        })
    }
  })
}
