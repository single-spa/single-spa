/* export interface ILogger {
    debug(...data: any[]): void;
    info(...data: any[]): void;
    warn(...data: any[]): void;
    error(...data: any[]): void;
}

const silentLogger: ILogger = {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop
};

let loggerInstance: ILogger = globalThis?.console;

export function setLogger(logger: boolean | ILogger) {
    if (!logger) {
        loggerInstance = silentLogger;
        return;
    }
    if (logger === true) {
        loggerInstance = console;
        return;
    }
    loggerInstance = logger;
}

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
 * @param logger A custom logger object, or the value `true` to log to the console, or the value 
 * `false` to deactivate all logging.
 */
export function setLogger(logger) {
    if (!logger) {
        loggerInstance = silentLogger;
        return;
    }
    if (logger === true) {
        loggerInstance = console;
        return;
    }
    loggerInstance = logger;
}

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
