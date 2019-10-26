import { AsyncAllIterable } from "@code-engine/types";
import { ono } from "ono";
import { iterateAll } from "./iterate-all";
import { validate } from "./validate";
import { valueToString } from "./value-to-string";

/**
 * Splits an iterable into separate ones that each iterate a subset of the values. Each value in the
 * original iterable will only be sent to ONE of the separate iterables. Values are sent in a first-come,
 * first-serve order, so some iterables may receive more values than others.
 */
export function splitIterable<T>(source: AsyncIterable<T>, concurrency: number): Array<AsyncAllIterable<T>> {
  if (!source || typeof source[Symbol.asyncIterator] !== "function") {
    let value = valueToString(source, { capitalize: true, article: true });
    throw ono.type(`${value} is not an async iterator.`);
  }

  validate.positiveInteger("concurrency", concurrency);

  let iterator = source[Symbol.asyncIterator]();
  return [...Array(concurrency)].map(() => createIterable<T>(iterator));
}


function createIterable<T>(iterator: AsyncIterator<T>): AsyncAllIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      return iterator;
    },

    all: iterateAll,
  };
}
