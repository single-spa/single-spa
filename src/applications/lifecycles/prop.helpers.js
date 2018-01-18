import { mountParcel } from 'src/parcels/mount-parcel.js';

export function getProps(appOrParcel) {
  const result = {
    name: appOrParcel.name,
    mountParcel: mountParcel.bind(appOrParcel),
    customProps: appOrParcel.customProps,
  };

  if (appOrParcel.unmountThisParcel) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }

  return result;
}
