import { CodeEngineEventEmitter, EventName, LogEventData, Logger, LogLevel } from "@code-engine/types";
import { assert } from "@jsdevtools/assert";

/**
 * Emits log messages via an EventEmitter.
 */
export function createLogEmitter(emitter: CodeEngineEventEmitter, debug: boolean): Logger {
  assert.value(emitter, "EventEmitter");
  assert.type.function(emitter.emit, "EventEmitter");

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
    emitter.emit(EventName.Log, logEventData);
  };

  log.debug = (message: string, data?: object | undefined) => {
    if (debug) {
      message = String(message || "");
      let logEventData: LogEventData = { ...data, message, level: LogLevel.Debug };
      emitter.emit(EventName.Log, logEventData);
    }
  };

  log.warn = (warning: string | Error, data?: object | undefined) => {
    let logEventData: LogEventData = { ...data, ...splitError(warning, debug), level: LogLevel.Warning };
    emitter.emit(EventName.Log, logEventData);
  };

  log.error = (error: string | Error, data?: object | undefined) => {
    let logEventData: LogEventData = { ...data, ...splitError(error, debug), level: LogLevel.Error };
    emitter.emit(EventName.Log, logEventData);
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
