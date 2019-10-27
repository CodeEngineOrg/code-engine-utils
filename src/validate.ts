import { ono } from "ono";
import { valueToString } from "./value-to-string";
import { valuesToString } from "./values-to-string";

/**
 * CodeEngine validation functions
 */
export const validate = {
  /**
   * Validates a numeric value (positive or negative, integer or float).
   */
  number(fieldName: string, value: number | undefined, defaultValue?: number): number {
    if (value === undefined) {
      value = defaultValue;
    }

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw ono.type(`Invalid ${fieldName} value: ${valueToString(value)}. Expected a number.`);
    }

    return value;
  },

  /**
   * Validates an integer value (positive or negative).
   */
  integer(fieldName: string, value: number | undefined, defaultValue?: number): number {
    value = validate.number(fieldName, value, defaultValue);

    if (!Number.isInteger(value)) {
      throw ono.type(`Invalid ${fieldName} value: ${valueToString(value)}. Expected an integer.`);
    }

    return value;
  },

  /**
   * Validates a positive integer value.
   */
  positiveInteger(fieldName: string, value: number | undefined, defaultValue?: number): number {
    value = validate.integer(fieldName, value, defaultValue);

    if (value < 1) {
      throw ono.range(`Invalid ${fieldName} value: ${valueToString(value)}. Expected a positive integer.`);
    }

    return value;
  },

  /**
   * Validates a value that is one of the specified values.
   */
  oneOf<T>(fieldName: string, value: T | undefined, values: T[], defaultValue?: T): T {
    if (value === undefined) {
      value = defaultValue;
    }

    if (!values.includes(value as T)) {
      throw ono.type(
        `Invalid ${fieldName} value: ${valueToString(value)}. ` +
        `Expected ${valuesToString(values, { conjunction: "or" })}.`
      );
    }

    return value as T;
  },
};
