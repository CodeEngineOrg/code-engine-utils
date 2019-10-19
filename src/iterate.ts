import { AsyncAllGenerator, AsyncAllIterable, ZeroOrMore } from "@code-engine/types";
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
  else {
    let generator = generate(values) as AsyncAllGenerator<T>;
    generator.all = iterateAll;
    return generator as AsyncAllIterable<T>;
  }
}


/**
 * A generator that iterates over any value or list of values.
 */
async function* generate<T>(value: ZeroOrMore<T> | Promise<ZeroOrMore<T>>): AsyncGenerator<T> {
  // If the value is async, then wait for it to be fulfilled
  value = await value;

  if (value === undefined) {
    // There's no value, so exit without yielding anything
    return value;
  }

  // Determine if the value is iterable
  let iterator = getIterator(value);

  if (iterator) {
    // Iterate over the value
    while (true) {
      let result: IteratorResult<T> = await iterator.next();

      if (result.done) {
        return result.value;
      }
      else {
        yield result.value;
      }
    }
  }
  else {
    // The value is not iterable, so just yield it as a single value
    yield value as T;
  }
}
