import { ono } from "ono";
import { valueToString } from "./value-to-string";

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
      let value = valueToString(concurrency, { article: true });
      throw ono.type(`Concurrency must be a positive integer, not ${value}.`);
    }
    if (!concurrency || concurrency < 1 || !Number.isInteger(concurrency)) {
      throw ono.range(`Concurrency must be a positive integer, not ${concurrency}.`);
    }

    return concurrency;
  }
};
