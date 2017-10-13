import * as  stringify from "json-stringify-safe";
import * as _ from "lodash";
import * as serializeError from "serialize-error";
import * as winston from "winston";
import * as context from "./cls";

export function formatter(options: any): string {
    const executionContext = context.get();

    let ctx;
    if (executionContext) {
        if (executionContext.correlationId) {
            ctx = options.colorize ? winston.config.colorize(options.level, executionContext.correlationId)
                : executionContext.correlationId;
        }
        if (executionContext.teamId) {
            ctx += ":" + (options.colorize ? winston.config.colorize(options.level, executionContext.teamId)
                : executionContext.teamId);
        }
        if (executionContext.operation) {
            ctx += ":" + (options.colorize ? winston.config.colorize(options.level, executionContext.operation)
                : executionContext.operation);
        }
    }

    const level = options.colorize ? winston.config.colorize(options.level, _.padEnd(options.level, 5)) :
        _.padEnd(options.level, 5);

    const formatted = (options.timestamp ? new Date().toISOString() : "") + (ctx ? " [" + ctx + "]" : "")
        + " [" + level + "] " + (options.message ? options.message : "") +
        (options.meta && Object.keys(options.meta).length ?
            (options.message ? ": " : "") + stringify(options.meta) : "");

    return formatted;
}

const winstonLogger = new winston.Logger({
    level: "debug",
    // handleExceptions: true,
    // humanReadableUnhandledException: true,
    exitOnError: false,
    transports: [
        new (winston.transports.Console)({
            json: false,
            colorize: true,
            prettyPrint: true,
            timestamp: true,
            showLevel: true,
            align: true,
            stderrLevels: [ "error" ],
            formatter,
            // handleExceptions: true,
            // humanReadableUnhandledException: true,
        }),
    ],
});

export const logger: Logger = winstonLogger;

// Redirect console logging methods to our logging setup
console.error = (message?: any, ...optionalParams: any[]) => {
    winstonLogger.error(message, ...optionalParams);
};
console.info = (message?: any, ...optionalParams: any[]) => {
    winstonLogger.info(message, ...optionalParams);
};
console.log = (message?: any, ...optionalParams: any[]) => {
    winstonLogger.info(message, ...optionalParams);
};
console.trace = (message?: any, ...optionalParams: any[]) => {
    winstonLogger.debug(message, ...optionalParams);
};
console.warn = (message?: any, ...optionalParams: any[]) => {
    winstonLogger.warn(message, ...optionalParams);
};

// Ideally we wouldn't need this, but I'm still adding proper error handling
process.on("uncaughtException", err => {
    console.error(serializeError(err));
});

export interface Logger {
    log: LogMethod;

    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    info: LeveledLogMethod;
    debug: LeveledLogMethod;
    verbose: LeveledLogMethod;
}

export interface LogMethod {
    (level: string, msg: string, callback: LogCallback): Logger;
    (level: string, msg: string, meta: any, callback: LogCallback): Logger;
    (level: string, msg: string, ...meta: any[]): Logger;
}

export interface LeveledLogMethod {
    (msg: string, callback: LogCallback): Logger;
    (msg: string, meta: any, callback: LogCallback): Logger;
    (msg: string, ...meta: any[]): Logger;
}

export type LogCallback = (error?: any, level?: string, msg?: string, meta?: any) => void;
