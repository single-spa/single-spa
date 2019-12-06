import { objectType } from "./app.helpers";

let errorHandlers = [];

export function handleAppError(err, app) {
  const transformedErr = transformErr(err, app);

  if (errorHandlers.length) {
    errorHandlers.forEach(handler => handler(transformedErr));
  } else {
    setTimeout(() => {
      throw transformedErr;
    });
  }
}

export function addErrorHandler(handler) {
  if (typeof handler !== "function") {
    throw Error(
      __DEV__
        ? devErrorMessage(28, "a single-spa error handler must be a function")
        : prodErrorMessage(28)
    );
  }

  errorHandlers.push(handler);
}

export function removeErrorHandler(handler) {
  if (typeof handler !== "function") {
    throw Error(
      __DEV__
        ? devErrorMessage(29, "a single-spa error handler must be a function")
        : prodErrorMessage(29)
    );
  }

  let removedSomething = false;
  errorHandlers = errorHandlers.filter(h => {
    const isHandler = h === handler;
    removedSomething = removedSomething || isHandler;
    return !isHandler;
  });

  return removedSomething;
}

export function prodErrorMessage(code, ...args) {
  return `single-spa minified message #${code}: See https://single-spa.js.org/error/${code}.html${
    args.length ? `?arg=${args.join("&arg=")}` : ""
  }`;
}

export function devErrorMessage(code, msg, ...args) {
  return `single-spa message #${code}: ${msg}. See https://single-spa.js.org/error/${code}.html${
    args.length ? `?arg=${args.join("&arg")}` : ""
  }`;
}

export function transformErr(ogErr, appOrParcel) {
  const errPrefix = `${objectType(appOrParcel)} '${
    appOrParcel.name
  }' died in status ${appOrParcel.status}: `;

  let result;

  if (ogErr instanceof Error) {
    try {
      ogErr.message = errPrefix + ogErr.message;
    } catch (err) {
      /* Some errors have read-only message properties, in which case there is nothing
       * that we can do.
       */
    }
    result = ogErr;
  } else {
    console.warn(
      __DEV__
        ? devErrorMessage(
            30,
            `While ${appOrParcel.status}, '${appOrParcel.name}' rejected its lifecycle function promise with a non-Error. This will cause stack traces to not be accurate.`,
            appOrParcel.status,
            appOrParcel.name
          )
        : prodErrorMessage(30, appOrParcel.status, appOrParcel.name)
    );
    try {
      result = Error(errPrefix + JSON.stringify(ogErr));
    } catch (err) {
      // If it's not an Error and you can't stringify it, then what else can you even do to it?
      result = ogErr;
    }
  }

  result.appName = appOrParcel.name;
  result.appOrParcelName = appOrParcel.name;
  try {
    result.name = appOrParcel.name;
  } catch (err) {
    // See https://github.com/CanopyTax/single-spa/issues/323
    // In a future major release, we can remove the `name` property altogether,
    // as a breaking change, in favor of appOrParcelName.
  }

  return result;
}
