import { AsyncAllIterableIterator } from "@code-engine/types";
import { ono } from "ono";
import { demandIterator } from "./get-iterator";
import { iterateAll } from "./iterate-all";
import { pending, Pending } from "./pending";


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
  private _sourceCounter = 0;

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
    await new Promise(async (resolve) => {
      // Store a function that resolves the write() promise when the value is read
      this._values.push(() => {
        resolve();
        return value;
      });

      // If there are any pending reads, then read them now that we have data
      await this._resolvePendingReads();
    });
  }

  /**
   * Writes all values from the given source to the iterable.
   */
  public writeFrom(source: AsyncIterable<T>): void {
    this._assertWritable();
    this._sourceCounter++;
    let iterator = demandIterator(source);

    // Reads the next result from the async iterator and processes it
    let readNextResult = () => {
      Promise.resolve().then(() => iterator.next()).then(onResult, onError);
    };

    // Process a result from the async iterator
    let onResult = (result: IteratorResult<T>) => {
      if (result.done) {
        this._sourceCounter--;
        this._resolvePendingReads().then(() => undefined, onError);
      }
      else {
        // Add the value to our queue and resolve any pending reads
        this._values.push(() => result.value);
        this._resolvePendingReads().then(readNextResult, onError);
      }
    };

    // If the async iterator throws an error, then our iterable re-throws it
    let onError = (error: Error) => {
      // Add a "value" to our queue that throws an error when read
      this._values.push(() => { throw error; });

      // tslint:disable-next-line: no-floating-promises
      this._resolvePendingReads();
    };

    // Start reading results from the iterator
    readNextResult();
  }

  /**
   * Indicates that the iterable is done being written to, and waits for all written values to be read.
   */
  public async end(): Promise<void> {
    this._doneWriting = true;
    await this._resolvePendingReads();
    return this._pendingEnd.promise;
  }

  /**
   * Reads the next value, or waits for one to be written.
   * @internal
   */
  private  async _read(): Promise<IteratorResult<T>> {
    let getValue = this._values.shift();

    if (getValue) {
      let value = getValue();
      return { value };
    }
    else if (this._allDone()) {
      await this._pendingEnd.resolve();
      return { done: true, value: undefined };
    }
    else {
      let pendingRead = pending<IteratorResult<T>>();
      this._pendingReads.push(pendingRead);
      return pendingRead.promise;
    }
  }

  /**
   * Resolves any pending `iterable.next()` calls using queued values.
   * @internal
   */
  private async _resolvePendingReads() {
    while (this._pendingReads.length > 0) {
      if (this._values.length > 0) {
        // NOTE: It's important that BOTH of these values are gotten synchronously
        // DO NOT use `await` until we have BOTH values
        let pendingRead = this._pendingReads.shift()!;
        let getValue = this._values.shift()!;

        try {
          let value = getValue();
          await pendingRead.resolve({ value });
        }
        catch (error) {
          await pendingRead.reject(error as Error);
        }
      }
      else if (this._allDone()) {
        let pendingRead = this._pendingReads.shift()!;
        await pendingRead.resolve({ done: true, value: undefined });
        await this._pendingEnd.resolve();
      }
      else {
        break;
      }
    }
  }

  /**
   * Determines whether all values have been written and read.
   * @internal
   */
  private _allDone() {
    return this._doneWriting &&
      this._values.length === 0 &&
      this._sourceCounter === 0;
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
