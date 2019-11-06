import { ono } from "ono";
import { functionName } from "./type-name";
import { valueToString } from "./value-to-string";
import { humanizeList, valuesToString } from "./values-to-string";

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
  string<T extends string>(value: T | undefined, fieldName = "value", defaultValue?: T): T {
    value = validate.hasValue(value, fieldName, defaultValue);

    if (typeof value !== "string") {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected a string.`);
    }

    return value;
  },

  /**
   * Validates a string with at least the specified number of characters.
   */
  minLength<T extends string>(value: T | undefined, minLength = 1, fieldName = "value", defaultValue?: T): T {
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
  number<T extends number>(value: T | undefined, fieldName = "value", defaultValue?: T): T {
    value = validate.hasValue(value, fieldName, defaultValue);

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected a number.`);
    }

    return value;
  },

  /**
   * Validates an integer value (positive or negative).
   */
  integer<T extends number>(value: T | undefined, fieldName = "value", defaultValue?: T): T {
    value = validate.number(value, fieldName, defaultValue);

    if (!Number.isInteger(value)) {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected an integer.`);
    }

    return value;
  },

  /**
   * Validates a positive integer value.
   */
  positiveInteger<T extends number>(value: T | undefined, fieldName = "value", defaultValue?: T): T {
    value = validate.integer(value, fieldName, defaultValue);

    if (value as number < 1) {
      throw ono.range(`Invalid ${fieldName}: ${valueToString(value)}. Expected a positive integer.`);
    }

    return value;
  },

  /**
   * Validates any object value (including empty objects, but **not** including `null`).
   */
  object<T extends object>(value: T | undefined, fieldName = "value", defaultValue?: T): T {
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
  function<T extends Function>(value: T | undefined, fieldName = "value", defaultValue?: T): T {
    value = validate.hasValue(value, fieldName, defaultValue);

    if (typeof value !== "function") {
      throw ono.type(`Invalid ${fieldName}: ${valueToString(value)}. Expected a function.`);
    }

    return value;
  },

  /**
   * Validates a value that is one of the specified types.
   */
  // tslint:disable-next-line: ban-types no-null-undefined-union
  type<T>(value: T | undefined, types: Array<Function | undefined | null>, fieldName = "value", defaultValue?: T): T {
    if (value === undefined && defaultValue !== undefined) {
      value = defaultValue;
    }

    // Separate the types by category
    let specialValues = [], primitiveTypes: string[] = [], constructors = [];
    for (let type of types) {
      if (typeof type === "function") {
        constructors.push(type);

        // tslint:disable-next-line: switch-default
        switch (type) {
          case String:
            primitiveTypes.push("string");
            break;
          case Number:
            primitiveTypes.push("number");
            break;
          case Boolean:
            primitiveTypes.push("boolean");
            break;
          case BigInt:
            primitiveTypes.push("bigint");
            break;
          case Symbol:
            primitiveTypes.push("symbol");
            break;
        }
      }
      else {
        specialValues.push(type);
      }
    }

    // Check for "special" values
    if (specialValues.includes(value as undefined)) {
      return value as T;
    }

    // Check for primitive types
    if (primitiveTypes.includes(typeof value)) {
      return value as T;
    }

    // Check for instance types
    if (constructors.some((ctor) => value instanceof ctor)) {
      return value as T;
    }

    // If we get here, then the value is not an allowed type
    let typeNames = [
      ...primitiveTypes,
      ...constructors.map(functionName).filter((name) => !primitiveTypes.includes(name.toLowerCase())),
      ...specialValues.map(String),
    ];
    throw ono.type(
      `Invalid ${fieldName}: ${valueToString(value)}. ` +
      `Expected ${humanizeList(typeNames, { conjunction: "or" })}.`
    );
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
