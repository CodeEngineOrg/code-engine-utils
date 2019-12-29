import { Context, EventName, LogEventData, Logger, LogLevel } from "@code-engine/types";
import { validate } from "@code-engine/validate";
import { EventEmitter } from "events";

/**
 * Emits log messages via an EventEmitter.
 */
export function createLogEmitter(emitter: EventEmitter, context: Context): Logger {
  validate.value(emitter, "EventEmitter");
  validate.type.function(emitter.emit, "EventEmitter");
  validate.type.object(context, "CodeEngine context");

  function log(message: string | Error, data?: object): void {
    if (!message || typeof message === "string") {
      log.info(message, data);
    }
    else {
      log.error(message, data);
    }
  }

  log.info = (message: string, data?: object | undefined) => {
    message = String(message || "");
    let logEventData: LogEventData = { ...data, message, level: LogLevel.Info };
    emitter.emit(EventName.Log, logEventData, context);
  };

  log.debug = (message: string, data?: object | undefined) => {
    if (context.debug) {
      message = String(message || "");
      let logEventData: LogEventData = { ...data, message, level: LogLevel.Debug };
      emitter.emit(EventName.Log, logEventData, context);
    }
  };

  log.warn = (warning: string | Error, data?: object | undefined) => {
    let logEventData: LogEventData = { ...data, ...splitError(warning, context.debug), level: LogLevel.Warning };
    emitter.emit(EventName.Log, logEventData, context);
  };

  log.error = (error: string | Error, data?: object | undefined) => {
    let logEventData: LogEventData = { ...data, ...splitError(error, context.debug), level: LogLevel.Error };
    emitter.emit(EventName.Log, logEventData, context);
  };

  return log;
}

/**
 * Splits an Error or error message into two separate values.
 */
function splitError(arg: string | Error, debug: boolean) {
  arg = arg || "";

  if (typeof arg === "string") {
    return { message: arg };
  }
  else {
    let error = arg;
    let message = arg.message || String(arg);

    if (debug) {
      message = arg.stack || message;
    }

    return { message, error };
  }
}
