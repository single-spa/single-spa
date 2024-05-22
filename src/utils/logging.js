/* 
const silentLogger: ILogger = {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop
};

let loggerInstance: ILogger = globalThis?.console;

export function configureLogger(logger: null | ILogger) {
    if (!logger) {
        loggerInstance = silentLogger;
        return;
    }
    loggerInstance = logger;
};

export const logger = {
    debug(...data) {
        loggerInstance.debug(...data);
    },
    info(...data) {
        loggerInstance.info(...data);
    },
    warn(...data) {
        loggerInstance.warn(...data);
    },
    error(...data) {
        loggerInstance.error(...data);
    }
};
*/

import { formatErrorMessage } from "../applications/app-errors";

function noop() { }

const silentLogger = {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop
};

let loggerInstance = globalThis?.console;

/**
 * Sets a logger object to be used by the single-spa library to emit log messages.  By default, 
 * log messages are emitted to the console.
 * @param logger A custom logger object, or `null` to silence logging.  To restore logging to 
 * the console, pass the console object.
 */
export function configureLogger(logger) {
    if (logger === null) {
        loggerInstance = silentLogger;
        return;
    }
    if (typeof logger === 'object' &&
        typeof logger.debug === 'function'
        && typeof logger.info === "function"
        && typeof logger.warn === "function"
        && typeof logger.error === "function"
    ) {
        loggerInstance = logger;
    }
    else {
        loggerInstance.warn(
            formatErrorMessage(
                42,
                __DEV__ &&
                "The given logger does not conform to the ILogger interface."
            )
        );
    }
};

export const logger = {
    debug(...data) {
        loggerInstance.debug(...data);
    },
    info(...data) {
        loggerInstance.info(...data);
    },
    warn(...data) {
        loggerInstance.warn(...data);
    },
    error(...data) {
        loggerInstance.error(...data);
    }
};
