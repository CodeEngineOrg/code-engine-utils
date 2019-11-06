import { valueToString, ValueToStringOptions } from "./value-to-string";

/**
 * Returns a list of values as a comma separated string, like "one, two, three and four".
 */
export function valuesToString(values: unknown[], options: ValueToStringOptions = {}): string {
  let stringValues = values.map((value) => valueToString(value, options));
  return humanizeList(stringValues, options);
}

/**
 * Returns a list of strings as a comma separated string, like "one, two, three and four".
 */
export function humanizeList(values: string[], options: ValueToStringOptions): string {
  let lastValue = "", oxfordComma = "";

  if (values.length > 1) {
    let conjunction = options.conjunction || "and";
    lastValue = ` ${conjunction} ${values.pop()!}`;
  }

  if (values.length > 1) {
    oxfordComma = ",";
  }

  return values.join(", ") + oxfordComma + lastValue;
}
