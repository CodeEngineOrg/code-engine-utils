import { AsyncAllIterableIterator } from "@code-engine/types";
import { ono } from "ono";
import { demandIterator } from "./get-iterator";
import { iterateAll } from "./iterate-all";
import { pending, Pending } from "./pending";

/**
 * An iterable source that can be "piped" through an `IterableWriter`.
 * @internal
 */
interface Source<T> {
  iterator: Iterator<T> | AsyncIterator<T>;
  pendingReads: number;
  done?: boolean;
}

/**
 * Writes values to an asynchronous iterable.
 */
export class IterableWriter<T> {
  /** @internal */
  private _values: Array<() => T> = [];

  /** @internal */
  private _pendingReads: Array<Pending<IteratorResult<T>>> = [];

  /** @internal */
  private _pendingEnd = pending<void>();

  /** @internal */
  private _sources: Array<Source<T>> = [];

  /** @internal */
  private _doneWriting = false;

  /**
   * An iterable that iterates through the written values.
   */
  public readonly iterable: AsyncAllIterableIterator<T>;

  public constructor() {
    this.iterable = {
      [Symbol.asyncIterator]() {
        return this;
      },
      all: iterateAll,
      next: () => this._read(),
    };
  }

  /**
   * Writes a value to the iterable and waits for it to be read.
   */
  public async write(value: T): Promise<void> {
    this._assertWritable();

    // This promise resolves when the value is read
    await new Promise((resolve) => {
      // Store a function that resolves the write() promise when the value is read
      this._values.push(() => {
        resolve();
        return value;
      });

      // If there are any pending reads, then read them now that we have data
      this._resolvePendingReads();
    });
  }

  /**
   * Writes all values from the given source to the iterable.
   */
  public writeFrom(source: AsyncIterable<T>): void {
    this._assertWritable();
    let iterator = demandIterator(source);
    this._sources.push({ iterator, pendingReads: 0 });
    this._resolvePendingReads();
  }

  /**
   * Indicates that the iterable is done being written to, and waits for all written values to be read.
   */
  public async end(): Promise<void> {
    this._doneWriting = true;
    this._resolvePendingReads();
    await this._pendingEnd.promise;
  }

  /**
   * Reads the next value, or waits for one to be written.
   * @internal
   */
  private async _read(): Promise<IteratorResult<T>> {
    let getValue = this._values.shift();

    if (getValue) {
      let value = getValue();
      return { value };
    }
    else if (this._allDone()) {
      this._pendingEnd.resolve();
      return { done: true, value: undefined };
    }
    else {
      let pendingRead = pending<IteratorResult<T>>();
      this._pendingReads.push(pendingRead);

      this._resolvePendingReads();
      return pendingRead.promise;
    }
  }

  /**
   * Resolves any pending `iterable.next()` calls using queued values.
   * @internal
   */
  private _resolvePendingReads() {
    while (this._pendingReads.length > 0) {
      if (this._values.length > 0) {
        // NOTE: It's important that BOTH of these values are gotten synchronously
        // DO NOT use `await` until we have BOTH values
        let pendingRead = this._pendingReads.shift()!;
        let getValue = this._values.shift()!;

        try {
          let value = getValue();
          pendingRead.resolve({ value });
        }
        catch (error) {
          pendingRead.reject(error as Error);
        }
      }
      else if (this._allDone()) {
        let pendingRead = this._pendingReads.shift()!;
        pendingRead.resolve({ done: true, value: undefined });
        this._pendingEnd.resolve();
      }
      else {
        if (this._sources.length > 0) {
          // Read the next source value to fulfill this pending read
          this._readNextSourceValue();
        }

        break;
      }
    }
  }

  /**
   * Reads the next value from the first available source.
   */
  private _readNextSourceValue() {
    let activeSources = this._sources.filter((source) => !source.done);
    let hasZeroPending = activeSources.filter((source) => source.pendingReads === 0);

    if (hasZeroPending.length > 0) {
      // We should hve at least one pending read for each source,
      // since we don't know which source will provide a value first.
      for (let source of hasZeroPending) {
        source.pendingReads++;
        this._readNextFromSource(source);    // tslint:disable-line: no-floating-promises
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
      this._readNextFromSource(sourceToReadFrom);    // tslint:disable-line: no-floating-promises
    }
  }

  /**
   * Reads the next value from the specified source and adds it to the iterator's value queue.
   */
  private async _readNextFromSource(source: Source<T>): Promise<void> {
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
        this._values.push(() => result.value as T);
      }

      if (source.done && source.pendingReads === 0) {
        // This source is done, so remove it from the list
        let index = this._sources.indexOf(source);
        index >= 0 && this._sources.splice(index, 1);
      }
    }
    catch (error) {
      // The source threw an error, so our iterator needs to re-throw it.
      // So add a "value" to our queue that throws an error when read.
      this._values.push(() => { throw error; });
    }

    this._resolvePendingReads();
  }

  /**
   * Determines whether all values have been written and read.
   * @internal
   */
  private _allDone() {
    return this._doneWriting &&
      this._values.length === 0 &&
      this._sources.length === 0;
  }

  /**
   * Asserts that the iterable can still be written to.
   * @internal
   */
  private _assertWritable() {
    if (this._doneWriting) {
      throw ono(`Cannot write values after the iterator has ended.`);
    }
  }
}
