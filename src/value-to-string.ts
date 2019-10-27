import * as typeName from "type-name";

const vowels = ["a", "e", "i", "o", "u"];

/**
 * Returns a short, user-friendly string that represents the given value.
 * This is used for CodeEngine error messages.
 */
export function valueToString(value: unknown, options: ValueToStringOptions = {}): string {
  let type = typeof value;
  let str = String(value);
  let canHavArticle = true;

  let article = options.article;
  let capitalize = options.capitalize;
  let maxLength = options.maxLength || 25;

  if (value === null) {
    return capitalize ? "Null" : "null";
  }
  else if (value === undefined) {
    return capitalize ? "Undefined" : "undefined";
  }
  else if (type === "string") {
    if (str.length > maxLength) {
      return `"${str.slice(0, maxLength - 3)}..."`;
    }
    return `"${str}"`;
  }
  else if (Number.isNaN(value as number)) {
    return "NaN";
  }
  else if (str.length > 0 && Array.isArray(value)) {
    str = `[${str}]`;
  }

  if (type === "object") {
    if (str.length > 0 && str.length <= maxLength && !str.startsWith("[object ")) {
      canHavArticle = false;
    }
    else {
      str = typeName(value);

      if (str === "Object") {
        let keys = Object.keys(value as object);

        if (keys.length === 0) {
          str = "{}";
          canHavArticle = false;
        }
        else {
          str = `{${keys}}`;
          if (str.length <= maxLength) {
            canHavArticle = false;
          }
          else {
            str = "Object";
          }
        }
      }
    }
  }
  else if (str.length > 0 && str.length <= maxLength) {
    // tslint:disable-next-line: switch-default
    switch (type) {
      case "number":
      case "bigint":
      case "function":
        return str;

      case "boolean":
        canHavArticle = false;
    }
  }
  else {
    str = type;
  }

  if (article && canHavArticle) {
    let firstLetter = str[0].toLowerCase();

    if (vowels.includes(firstLetter)) {
      str = `an ${str}`;
    }
    else {
      str = `a ${str}`;
    }
  }

  if (capitalize) {
    str = str[0].toUpperCase() + str.slice(1);
  }

  return str;
}

/**
 * Options for the `valueToString()` function.
 */
export interface ValueToStringOptions {
  /**
   * The maximum length of a stringified value before its type is used instead.
   *
   * Defaults to `25`.
   */
  maxLength?: number;

  /**
   * Indicates whether the value string should be capitalized if applicable
   * (e.g. "Object" instead of "object").
   *
   * Defaults to `false`.
   */
  capitalize?: boolean;

  /**
   * Indicates whether the value string should be prefixed with an article if applicable
   * (e.g. "an object" instead of "object").
   *
   * Defaults to `false`.
   */
  article?: boolean;

  /**
   * The string used to join a list of values when calling `valuesToString()`.
   * This is usually either "and" or "or".
   *
   * Defautls to "and".
   */
  conjunction?: string;
}
