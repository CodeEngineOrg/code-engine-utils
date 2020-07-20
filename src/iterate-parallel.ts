import { assert } from "@jsdevtools/assert";
import { demandIterator } from "./get-iterator";
import { IterableWriter } from "./iterable-writer";

/**
 * Iterates over an iterable, always reading the specified number of values at a time.
 * Values are yielded in first-available order.
 */
export function iterateParallel<T>(iterable: AsyncIterable<T>, concurrency: number): AsyncIterable<T> {
  let iterator = demandIterator(iterable);
  concurrency = assert.number.integer.positive(concurrency, "concurrency");
  let pendingReads = 0;
  let done = false;

  let writer = new IterableWriter<T>();
  writer.onRead = read;
  return writer.iterable;

  /**
   * Reads one or more values from the iterator
   */
  function read() {
    while (!done && pendingReads < concurrency) {
      pendingReads++;
      readNext();       // tslint:disable-line: no-floating-promises
    }
  }

  /**
   * Reads the next result from the iterator
   */
  async function readNext(): Promise<void> {
    try {
      let result = await iterator.next();

      if (result.done) {
        // The iterator is done. But don't call writer.end() yet,
        // because there may still be other reads in progress.
        done = true;
      }
      else {
        await writer.write(result.value);
      }

      pendingReads--;

      if (done && pendingReads === 0) {
        // This was the last pending read, so now we can end the writer
        await writer.end();
      }
      else if (!done) {
        // There's more to read
        read();
      }
    }
    catch (error) {
      await writer.throw(error as Error);
    }
  }
}
