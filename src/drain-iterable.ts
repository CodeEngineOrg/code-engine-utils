import { demandIterator } from "./get-iterator";

/**
 * Iterates over all values in an async iterable to trigger any side-effects of reading each value.
 */
// tslint:disable-next-line: no-async-without-await
export async function drainIterable<T>(iterable: AsyncIterable<T>): Promise<void> {
  let iterator = demandIterator(iterable);
  while (true) {
    let { done } = await iterator.next();
    if (done) {
      break;
    }
  }
}
