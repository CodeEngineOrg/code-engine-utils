import { AsyncAllIterableIterator } from "@code-engine/types";
import { ono } from "ono";
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
  private _onRead?: () => void;

  /** @internal */
  private _doneWriting = false;

  /**
   * An iterable that iterates through the written values.
   */
  public readonly iterable: AsyncAllIterableIterator<T>;

  /**
   * An optional event handler that is called whenever the consumer tries to read a value but none
   * have been written yet.  This event handler should call the `write()` method to supply a value
   * as soon as possible.
   */
  public get onRead() {
    return this._onRead;
  }

  public set onRead(value: (() => void) | undefined) {
    if (value && this._onRead) {
      throw ono(`Only one "onRead" event handler is allowed.`);
    }

    this._onRead = value;
  }

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
   * Indicates whether the consumer is currently awaiting a value.
   */
  public get hasPendingReads(): boolean {
    return this._pendingReads.length > 0;
  }

  /**
   * Writes a value to the iterable and waits for it to be read.
   */
  public async write(value: T): Promise<void> {
    await this._write(() => value);
  }

  /**
   * Causes the iterable to throw the specified error when read.
   */
  public async throw(error: Error): Promise<void> {
    await this._write(() => { throw error; });
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
   * Writes a value to the iterable and waits for it to be read.
   * @internal
   */
  private async _write(getValue: () => T): Promise<void> {
    this._assertWritable();

    // This promise resolves when the value is read
    await new Promise((resolve) => {
      // Store a function that resolves the write() promise when the value is read
      this._values.push(() => {
        resolve();
        return getValue();
      });

      // If there are any pending reads, then read them now that we have data
      this._resolvePendingReads();
    });
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
        if (this._onRead) {
          // Raise the "onRead" event, to let the writer know that a value is needed
          this._onRead();
        }

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
      this._values.length === 0;
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
