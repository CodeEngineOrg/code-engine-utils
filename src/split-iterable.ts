import { stringify } from "@code-engine/stringify";
import { validate } from "@code-engine/validate";
import { ono } from "@jsdevtools/ono";

/**
 * Splits an iterable into separate ones that each iterate a subset of the values. Each value in the
 * original iterable will only be sent to ONE of the separate iterables. Values are sent in a first-come,
 * first-serve order, so some iterables may receive more values than others.
 */
export function splitIterable<T>(source: AsyncIterable<T>, concurrency: number): Array<AsyncIterable<T>> {
  if (!source || typeof source[Symbol.asyncIterator] !== "function") {
    let value = stringify(source, { capitalize: true, article: true });
    throw ono.type(`${value} is not an async iterator.`);
  }

  validate.number.integer.positive(concurrency, "concurrency");

  let iterator = source[Symbol.asyncIterator]();
  return [...Array(concurrency)].map(() => createIterable<T>(iterator));
}


function createIterable<T>(iterator: AsyncIterator<T>): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      return iterator;
    },
  };
}
