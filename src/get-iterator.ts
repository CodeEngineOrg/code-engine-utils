import { stringify } from "@jsdevtools/humanize-anything";
import { ZeroOrMore } from "@code-engine/types";
import { ono } from "@jsdevtools/ono";

/**
 * Returns the given value's iterator, or wraps a non-iterable value in an iterator.
 */
export function getIterator<T>(iterable: ZeroOrMore<T>): Iterator<T> | AsyncIterator<T> {
  if (iterable === undefined) {
    // There is no iterator, so we'll return an empty iterator
    return [][Symbol.iterator]();
  }

  // Determine if the value is iterable
  let iterator = tryGetIterator(iterable);

  if (!iterator) {
    // The value is not iterable, so wrap it in an iterator
    return [iterable as T][Symbol.iterator]();
  }

  return iterator;
}

/**
 * Returns the given value's iterator, or throws an error if the value is not iterable.
 */
export function demandIterator<T>(iterable: ZeroOrMore<T>): Iterator<T> | AsyncIterator<T> {
  let iterator = tryGetIterator(iterable);

  if (!iterator || typeof iterator.next !== "function") {
    let value = stringify(iterable, { capitalize: true, article: true });
    throw ono.type(`${value} is not iterable.`);
  }

  return iterator;
}

/**
 * Returns the given value's iterator, if possible.
 */
function tryGetIterator<T>(iterable: ZeroOrMore<T>): Iterator<T> | AsyncIterator<T> | undefined {
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
