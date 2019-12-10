import { iterateParallel } from "./iterate-parallel";

/**
 * Iterates over all values in an async iterable, optionally multiple values at a time.
 * The values are immediately discarded, so very little memory is consumed.
 */
export async function drainIterable<T>(iterable: AsyncIterable<T>, concurrency = 1): Promise<void> {
  let iterator = iterateParallel(iterable, concurrency)[Symbol.asyncIterator]();

  while (true) {
    let { done } = await iterator.next();
    if (done) {
      break;
    }
  }
}
