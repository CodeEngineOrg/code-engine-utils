// tslint:disable: no-floating-promises
import { AsyncAllIterable } from "@code-engine/types";
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
export function joinIterables<T>(...sources: Array<AsyncIterable<T>>): AsyncAllIterable<T> {
  let writer = new IterableWriter<T>();
  /**
   * Reads the next value from the first available source.
   */
  function readFromSources() {
    let activeSources = sources.filter((source) => !source.done);
    let hasZeroPending = activeSources.filter((source) => source.pendingReads === 0);

    if (hasZeroPending.length > 0) {
      // We should always have at least one pending read for each source,
      // since we don't know which source will provide a value first.
      for (let source of hasZeroPending) {
        source.pendingReads++;
        readNextFromSource(source);
      }
    }
    else if (activeSources.length > 0) {
      let sourceToReadFrom = activeSources[0];

      // Find the source with the fewest pending reads
      for (let source of activeSources) {
        if (source.pendingReads < sourceToReadFrom.pendingReads) {
          sourceToReadFrom = source;
        }
      }

      sourceToReadFrom.pendingReads++;
      readNextFromSource(sourceToReadFrom);
    }
    else if (sources.length === 0) {
      // We've finished reading all values from all sources
      writer.end();
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
    }
    catch (error) {
      // The source threw an error, so our iterator needs to re-throw it.
      // So add a "value" to our queue that throws an error when read.
      await writer.throw(error as Error);
    }
  }
}
