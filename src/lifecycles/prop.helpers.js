import * as singleSpa from "../single-spa.js";
import { mountParcel } from "../parcels/mount-parcel.js";
import { assign } from "../utils/assign.js";
import { isParcel, toDynamicPathRegexInfo, toName } from "../applications/app.helpers.js";
import { formatErrorMessage } from "../applications/app-errors.js";

export function getProps(appOrParcel) {
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
  let pathParams = {};

  if (typeof appOrParcel.activeWhen === "string") {
    pathParams = extractDynamicParams(appOrParcel.activeWhen, window.location);
  }

  const result = assign({}, customProps, {
    name,
    mountParcel: mountParcel.bind(appOrParcel),
    singleSpa,
    route: {
      params: pathParams,
    }
  });

  if (isParcel(appOrParcel)) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }

  return result;
}

function extractDynamicParams(activeWhen, location) {
  const { regex, paramNames } = toDynamicPathRegexInfo(activeWhen);
  const origin = location.origin || `${location.protocol}//${location.host}`;
  const route = location.href
    .replace(origin, "")
    .replace(location.search, "")
    .split("?")[0];

  const match = regex.exec(route);
  if (match) {
    const params = {};
    paramNames.forEach((paramName, index) => {
      params[paramName] = match[index + 1];
    });
    return params;
  }
  return null;
}
