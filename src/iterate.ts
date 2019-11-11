import { AsyncAllIterable, ZeroOrMore } from "@code-engine/types";
import { getIterator } from "./get-iterator";
import { iterateAll } from "./iterate-all";


/**
 * Iterates over any value or list of values.
 */
export function iterate<T>(values: ZeroOrMore<T> | Promise<ZeroOrMore<T>>): AsyncAllIterable<T> {
  let asyncIterable = values as AsyncAllIterable<T>;

  if (asyncIterable
  && asyncIterable.all === iterateAll
  && typeof asyncIterable[Symbol.asyncIterator] === "function") {
    // The value is already an AsyncAllIterable, so return it as-is.
    return asyncIterable;
  }

  return {
    all: iterateAll,
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
