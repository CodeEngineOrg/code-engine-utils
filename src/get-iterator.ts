import { ZeroOrMore } from "@code-engine/types";
import { ono } from "ono";
import { valueToString } from "./value-to-string";

/**
 * Returns the given value's iterator, if possible.
 */
export function getIterator<T>(iterable: ZeroOrMore<T>): Iterator<T> | AsyncIterator<T> | undefined {
  if (iterable) {
    let asyncIterable = iterable as AsyncIterable<T>;
    let syncIterable = iterable as Iterable<T>;
    let iterator = iterable as Iterator<T>;

    if (typeof asyncIterable[Symbol.asyncIterator] === "function") {
      return asyncIterable[Symbol.asyncIterator]();
    }
    else if (typeof syncIterable[Symbol.iterator] === "function") {
      return syncIterable[Symbol.iterator]();
    }
    else if (typeof iterator.next === "function") {
      return iterator;
    }
  }
}

/**
 * Returns the given value's iterator, or throws an error if the value is not iterable.
 */
export function demandIterator<T>(iterable: ZeroOrMore<T>): Iterator<T> | AsyncIterator<T> {
  let iterator = getIterator(iterable);

  if (!iterator) {
    let value = valueToString(iterable, { capitalize: true, article: true });
    throw ono.type(`${value} is not iterable.`);
  }

  return iterator;
}
