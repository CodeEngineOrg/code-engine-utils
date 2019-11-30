// tslint:disable: no-floating-promises
import { demandIterator } from "./get-iterator";
import { IterableWriter } from "./iterable-writer";

/**
 * An iterable source
 * @internal
 */
interface Source<T> {
  iterator: Iterator<T> | AsyncIterator<T>;
  pendingReads: number;
  done: boolean;
}

/**
 * Joins multiple iterables into a single one that yields values in first-available order.
 */
export function joinIterables<T>(...iterables: Array<AsyncIterable<T>>): AsyncIterable<T> {
  let sources = iterables.map((iterable) => ({
    iterator: demandIterator(iterable),
    pendingReads: 0,
    done: false,
  }));

  // The number of times that onRead() has been called
  let onReadCounter = 0;

  // The number of actual reads we've requested from the sources. This will usually be higher
  // than onReadCounter because we always have at least one pending read for each source.
  let actualReadCounter = 0;

  let writer = new IterableWriter<T>();
  writer.onRead = readFromSources;
  return writer.iterable;

  /**
   * Reads the next value from the first available source.
   */
  function readFromSources() {
    if (sources.length === 0) {
      // We've finished reading all values from all sources
      return writer.end();
    }

    onReadCounter++;

    let activeSources = sources.filter((source) => !source.done);
    let hasZeroPending = activeSources.filter((source) => source.pendingReads === 0);

    if (hasZeroPending.length > 0) {
      // We should always have at least one pending read for each source,
      // since we don't know which source will provide a value first.
      for (let source of hasZeroPending) {
        actualReadCounter++;
        source.pendingReads++;
        readNextFromSource(source);
      }
    }
    else if (activeSources.length > 0 && onReadCounter > actualReadCounter) {
      let sourceToReadFrom = activeSources[0];

      // Find the source with the fewest pending reads
      for (let source of activeSources) {
        if (source.pendingReads < sourceToReadFrom.pendingReads) {
          sourceToReadFrom = source;
        }
      }

      actualReadCounter++;
      sourceToReadFrom.pendingReads++;
      readNextFromSource(sourceToReadFrom);
    }
  }

  /**
   * Reads the next value from the specified source
   */
  async function readNextFromSource(source: Source<T>): Promise<void> {
    try {
      // Read the next value from the source
      let result = await source.iterator.next();

      // Decrement the pending read counter, now that this read is complete
      source.pendingReads--;

      if (result.done) {
        source.done = true;
      }
      else {
        // Add the value to our queue
        await writer.write(result.value);
      }

      if (source.done && source.pendingReads === 0) {
        // This source is done, so remove it from the list
        let index = sources.indexOf(source);
        index >= 0 && sources.splice(index, 1);
      }

      if (sources.length === 0) {
        await writer.end();
      }
      else if (result.done) {
        // We tried to read a value from this source, but it didn't have any more values.
        // But we still need a value, so read from a different source instead.
        readFromSources();
      }
    }
    catch (error) {
      // The source threw an error, so our iterator needs to re-throw it.
      // So add a "value" to our queue that throws an error when read.
      await writer.throw(error as Error);
    }
  }
}
