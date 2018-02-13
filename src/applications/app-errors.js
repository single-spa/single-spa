import CustomEvent from 'custom-event';

let errorHandlers = []

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
  if (typeof handler !== 'function') {
    throw new Error('a single-spa error handler must be a function');
  }

  errorHandlers.push(handler);
}

export function removeErrorHandler(handler) {
  if (typeof handler !== 'function') {
    throw new Error('a single-spa error handler must be a function');
  }

  let removedSomething = false;
  errorHandlers = errorHandlers.filter(h => {
    const isHandler = h === handler;
    removedSomething = removedSomething || isHandler;
    return !isHandler;
  })

  return removedSomething;
}

function transformErr(ogErr, app) {
  const errPrefix = `'${app.name}' died in status ${app.status}: `;

  let result;

  if (ogErr instanceof Error) {
    try {
      ogErr.message = errPrefix + ogErr.message;
    } catch(err) {
      /* Some errors have read-only message properties, in which case there is nothing
       * that we can do.
       */
    }
    result = ogErr;
  } else {
    console.warn(`While ${app.status}, '${app.name}' rejected its lifecycle function promise with a non-Error. This will cause stack traces to not be accurate.`);
    try {
      result = new Error(errPrefix + JSON.stringify(ogErr));
    } catch(err) {
      // If it's not an Error and you can't stringify it, then what else can you even do to it?
      result = ogErr;
    }
  }

  result.appName = app.name;

  return result;
}
