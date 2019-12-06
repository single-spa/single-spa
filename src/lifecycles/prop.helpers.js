import * as singleSpa from "../single-spa.js";
import { mountParcel } from "../parcels/mount-parcel.js";
import { isParcel } from "../applications/app.helpers.js";

export function getProps(appOrParcel) {
  const result = {
    ...appOrParcel.customProps,
    name: appOrParcel.name,
    mountParcel: mountParcel.bind(appOrParcel),
    singleSpa
  };

  if (isParcel(appOrParcel)) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }

  return result;
}
