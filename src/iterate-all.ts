/**
 * Iterates over all items in an async iterable and returns them as an array.
 *
 * This is a workaround for the lack of an async spread operator and/or support for async iterables
 * in `Promise.all()`.
 *
 * @see https://github.com/tc39/proposal-async-iteration/issues/103
 */
export function iterateAll<T>(this: AsyncIterable<T>): Promise<T[]>;
export function iterateAll<T>(iterable?: AsyncIterable<T>): Promise<T[]>;

export async function iterateAll<T>(this: AsyncIterable<T>, iterable?: AsyncIterable<T>): Promise<T[]> {
  // The async iterable can be passed-in as an argument, or bound to `this`
  iterable = iterable || this;

  let items = [];
  for await (let item of iterable) {
    items.push(item);
  }

  return items;
}
