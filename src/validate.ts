import { ono } from "ono";
import * as typeName from "type-name";

/**
 * CodeEngine validation functions
 */
export const validate = {
  /**
   * Validates the given concurrency value and returns it, or the default value, or throws an error.
   */
  concurrency(concurrency: number | undefined, defaultValue?: number): number {
    if (concurrency === undefined) {
      concurrency = defaultValue;
    }

    if (typeof concurrency !== "number") {
      throw ono.type(`Concurrency must be a positive integer, not ${typeName(concurrency)}.`);
    }
    if (!concurrency || concurrency < 1 || !Number.isInteger(concurrency)) {
      throw ono.range(`Concurrency must be a positive integer, not ${concurrency}.`);
    }

    return concurrency;
  }
};
