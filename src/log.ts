import { Logger, LogLevel } from "@code-engine/types";
import { ErrorLike, ono } from "@jsdevtools/ono";

/**
 * A helper method that logs a message using the given `Logger` object and the specified `LogLevel`.
 */
export function log(logger: Logger, level: LogLevel, message: string | ErrorLike, data?: object): void {
  switch (level) {
    case "info":
    case "log" as LogLevel:
      logger.info(message as string, data);
      break;

    case "warning":
    case "warn" as LogLevel:
      logger.warn(message as string | Error, data);
      break;

    case "debug":
      logger.debug(message as string, data);
      break;

    case "error":
      logger.error(message as string | Error, data);
      break;

    default:
      throw ono.type(`Invalid log level: ${level}`);
  }
}
