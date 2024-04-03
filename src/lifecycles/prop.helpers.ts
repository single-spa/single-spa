import * as singleSpa from "../single-spa";
import { mountParcel } from "../parcels/mount-parcel";
import { isParcel, toName } from "../applications/app.helpers";
import { formatErrorMessage } from "../applications/app-errors";
import { AppOrParcel, InternalParcel } from "./lifecycle.helpers";

interface SingleSpaProps {
  name: string;
  mountParcel: typeof mountParcel;
  singleSpa: typeof singleSpa;
  unmountSelf(): Promise<AppOrParcel>;
}

export function getProps(appOrParcel: AppOrParcel): SingleSpaProps {
  const name = toName(appOrParcel);
  let customProps =
    typeof appOrParcel.customProps === "function"
      ? appOrParcel.customProps(name, window.location)
      : appOrParcel.customProps;
  if (
    typeof customProps !== "object" ||
    customProps === null ||
    Array.isArray(customProps)
  ) {
    customProps = {};
    console.warn(
      formatErrorMessage(
        40,
        __DEV__ &&
          `single-spa: ${name}'s customProps function must return an object. Received ${customProps}`
      ),
      name,
      customProps
    );
  }
  const result: SingleSpaProps = Object.assign({}, customProps, {
    name,
    mountParcel: mountParcel.bind(appOrParcel),
    singleSpa,
  });

  if (isParcel(appOrParcel)) {
    result.unmountSelf = (appOrParcel as InternalParcel).unmountThisParcel;
  }

  return result;
}
