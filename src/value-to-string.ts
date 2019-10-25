import * as typeName from "type-name";

// The maximum length of a value before we opt to show the type name instead
const maxLength = 10;

const vowels = ["a", "e", "i", "o", "u"];

/**
 * Returns a short, user-friendly string that represents the given value.
 * This is used for CodeEngine error messages.
 */
export function valueToString(value: unknown, options: ValueToStringOptions = {}): string {
  let type = typeof value;
  let str = String(value);
  let canHavArticle = true;

  if (value === null) {
    return options.capitalize ? "Null" : "null";
  }
  else if (value === undefined) {
    return options.capitalize ? "Undefined" : "undefined";
  }
  else if (Number.isNaN(value as number)) {
    return "NaN";
  }
  else if (str.length > 0 && Array.isArray(value)) {
    str = `[${str}]`;
  }

  if (str.length > 0 && str.length <= maxLength) {
    // tslint:disable-next-line: switch-default
    switch (type) {
      case "string":
        return `"${str}"`;

      case "number":
      case "bigint":
      case "function":
        return str;

      case "boolean":
      case "object":
        canHavArticle = false;
    }
  }
  else if (type === "object") {
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
  else {
    str = type;
  }

  if (options.article && canHavArticle) {
    let firstLetter = str[0].toLowerCase();

    if (vowels.includes(firstLetter)) {
      str = `an ${str}`;
    }
    else {
      str = `a ${str}`;
    }
  }

  if (options.capitalize) {
    str = str[0].toUpperCase() + str.slice(1);
  }

  return str;
}

/**
 * Options for the `valueToString()` function.
 */
export interface ValueToStringOptions {
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
}
