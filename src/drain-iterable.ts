import { ConcurrentTasks } from "./concurrent-tasks";
import { demandIterator } from "./get-iterator";

/**
 * Iterates over all values in an async iterable to trigger any side-effects of reading each value.
 */
export async function drainIterable<T>(iterable: AsyncIterable<T>, concurrency = 1): Promise<void> {
  let iterator = demandIterator(iterable);
  let concurrentReads = new ConcurrentTasks(concurrency);
  let done = false;

  while (!done) {
    await concurrentReads.waitForAvailability();
    let promise = Promise.resolve(iterator.next()).then(isDone);
    concurrentReads.add(promise);
  }

  function isDone(result: IteratorResult<T>) {
    done = done || result.done === true;
  }
}
