import * as singleSpa from "../single-spa.js";
import { mountParcel } from "../parcels/mount-parcel.js";
import { isParcel, toName } from "../applications/app.helpers.js";

export function getProps(appOrParcel) {
  const result = {
    ...appOrParcel.customProps,
    name: toName(appOrParcel),
    mountParcel: mountParcel.bind(appOrParcel),
    singleSpa
  };

  if (isParcel(appOrParcel)) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }

  return result;
}
