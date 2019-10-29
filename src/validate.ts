import { ono } from "ono";
import { valueToString } from "./value-to-string";
import { valuesToString } from "./values-to-string";

/**
 * CodeEngine validation functions
 */
export const validate = {
  /**
   * Validates any value that is not `undefined` (even `null` and `NaN`).
   */
  hasValue<T>(value: T | undefined, fieldName = "value", defaultValue?: T): T {
    if (value === undefined) {
      value = defaultValue;
    }

    if (value === undefined) {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. A value is required.`);
    }

    return value;
  },

  /**
   * Validates a string value (including empty strings).
   */
  string(value: string | undefined, fieldName = "value", defaultValue?: string): string {
    value = validate.hasValue(value, fieldName, defaultValue);

    if (typeof value !== "string") {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected a string.`);
    }

    return value;
  },

  /**
   * Validates a string with at least the specified number of characters.
   */
  minLength(value: string | undefined, minLength = 1, fieldName = "value", defaultValue?: string): string {
    value = validate.string(value, fieldName, defaultValue);

    if (value.length < minLength) {
      if (minLength === 1) {
        throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. It cannot be empty.`);
      }
      else {
        throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. It should be at least ${minLength} characters.`);
      }
    }

    return value;
  },

  /**
   * Validates a numeric value (positive or negative, integer or float).
   */
  number(value: number | undefined, fieldName = "value", defaultValue?: number): number {
    value = validate.hasValue(value, fieldName, defaultValue);

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected a number.`);
    }

    return value;
  },

  /**
   * Validates an integer value (positive or negative).
   */
  integer(value: number | undefined, fieldName = "value", defaultValue?: number): number {
    value = validate.number(value, fieldName, defaultValue);

    if (!Number.isInteger(value)) {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected an integer.`);
    }

    return value;
  },

  /**
   * Validates a positive integer value.
   */
  positiveInteger(value: number | undefined, fieldName = "value", defaultValue?: number): number {
    value = validate.integer(value, fieldName, defaultValue);

    if (value < 1) {
      throw ono.range(`Invalid ${fieldName}: ${valueToString(value)}. Expected a positive integer.`);
    }

    return value;
  },

  /**
   * Validates any object value (including empty objects, but **not** including `null`).
   */
  object(value: object | undefined, fieldName = "value", defaultValue?: object): object {
    value = validate.hasValue(value, fieldName, defaultValue);

    if (typeof value !== "object" || value === null) {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected an object.`);
    }

    return value;
  },

  /**
   * Validates any function value (including classes, async functions, arrow functions, generator functions).
   */
  // tslint:disable-next-line: ban-types
  function(value: Function | undefined, fieldName = "value", defaultValue?: Function): Function {
    value = validate.hasValue(value, fieldName, defaultValue);

    if (typeof value !== "function") {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected a function.`);
    }

    return value;
  },

  /**
   * Validates a value that is one of the specified values.
   */
  oneOf<T>(value: T | undefined, values: T[], fieldName = "value", defaultValue?: T): T {
    value = validate.hasValue(value, fieldName, defaultValue);

    if (!values.includes(value)) {
      throw ono.type(
        `Invalid ${fieldName}: ${valueToString(value)}. ` +
        `Expected ${valuesToString(values, { conjunction: "or" })}.`
      );
    }

    return value;
  },
};
