import * as singleSpa from '../single-spa.js'
import { mountParcel } from '../parcels/mount-parcel.js';

export function getProps(appOrParcel) {
  const result = {
    ...appOrParcel.customProps,
    name: appOrParcel.name,
    mountParcel: mountParcel.bind(appOrParcel),
    singleSpa
  };

  if (appOrParcel.unmountThisParcel) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }

  return result;
}
