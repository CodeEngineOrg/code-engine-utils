import { demandIterator } from "./get-iterator";
import { IterableWriter } from "./iterable-writer";

/**
 * Debounces an async iterable, so all values that are yielded within a threshold are grouped together.
 */
export function debounceIterable<T>(iterable: AsyncIterable<T>, delay = 0): AsyncIterableIterator<T[]> {
  let iterator = demandIterator(iterable);
  let values: T[] = [];
  let timeout: NodeJS.Timeout | undefined;

  let writer = new IterableWriter<T[]>();
  writer.onRead = readNext;
  return writer.iterable;

  /**
   * Reads the next result from the iterator and processes it
   */
  async function readNext(): Promise<void> {
    try {
      let result = await iterator.next();

      if (timeout) {
        // A new result arrived within the threshold time, so clear the timeout
        clearTimeout(timeout);
      }

      if (result.done) {
        // All values have been read, so immediately write whatever we have
        await writeValues();
        await writer.end();
      }
      else {
        // Queue-up this value
        values.push(result.value);

        // Write all values as soon as the threshhold time passes,
        // unless additional values are received first
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        timeout = setTimeout(writeValues, delay);

        // Read the next value, possibly before the timeout expires
        return await readNext();
      }
    }
    catch (error) {
      await writer.throw(error as Error);
    }
  }

  /**
   * This function is called whenever the debounce threshold has passed.
   * If there are
   */
  function writeValues(): Promise<void> | undefined {
    timeout = undefined;

    // If there's a pending read, then fulfill it with all of the debounced values that have
    // been collected since the last read. If there's NOT a pending read, then just keep
    // collecting values for the next read.
    if (values.length > 0 && writer.hasPendingReads) {
      let batch = values;
      values = [];
      return writer.write(batch);
    }
  }
}
