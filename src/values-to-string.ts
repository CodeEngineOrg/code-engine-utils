import { valueToString, ValueToStringOptions } from "./value-to-string";

/**
 * Returns a list of values as a comma separated string, like "one, two, three and four".
 */
export function valuesToString(values: unknown[], options: ValueToStringOptions = {}): string {
  let stringValues = values.map((value) => valueToString(value, options));
  let lastValue = "", oxfordComma = "";

  if (values.length > 1) {
    let conjunction = options.conjunction || "and";
    lastValue = ` ${conjunction} ${stringValues.pop()!}`;
  }

  if (values.length > 2) {
    oxfordComma = ",";
  }

  return stringValues.join(", ") + oxfordComma + lastValue;
}
