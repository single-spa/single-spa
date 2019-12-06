import * as singleSpa from "../single-spa.js";
import { mountParcel } from "../parcels/mount-parcel.js";
import { assign } from "../utils/assign.js";

export function getProps(appOrParcel) {
  const result = assign({}, appOrParcel.customProps, {
    name: appOrParcel.name,
    mountParcel: mountParcel.bind(appOrParcel),
    singleSpa
  });

  if (appOrParcel.unmountThisParcel) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }

  return result;
}
