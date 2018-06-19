import { mountParcel } from 'src/parcels/mount-parcel.js';

export function getProps(appOrParcel) {
  const result = {
    ...appOrParcel.customProps,
    name: appOrParcel.name,
    mountParcel: mountParcel.bind(appOrParcel),
  };

  if (appOrParcel.unmountThisParcel) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }

  return result;
}
