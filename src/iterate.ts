import { ZeroOrMore } from "@code-engine/types";
import { getIterator } from "./get-iterator";


/**
 * Iterates over any value or list of values.
 */
export function iterate<T>(values: ZeroOrMore<T> | Promise<ZeroOrMore<T>>): AsyncIterable<T> {
  let asyncIterable = values as AsyncIterable<T>;

  if (asyncIterable && typeof asyncIterable[Symbol.asyncIterator] === "function") {
    // The value is already an AsyncIterable, so return it as-is.
    return asyncIterable;
  }

  return {
    [Symbol.asyncIterator]() {
      return asyncIterator(values);
    }
  };
}

/**
 * Asynchronously iterates over any value or list of values.
 */
function asyncIterator<T>(values: ZeroOrMore<T> | Promise<ZeroOrMore<T>>): AsyncIterator<T> {
  // If the value is async, then wait for it to be fulfilled
  let iterator = Promise.resolve(values).then(getIterator);

  return {
    async next() {
      return (await iterator).next();
    }
  };
}
