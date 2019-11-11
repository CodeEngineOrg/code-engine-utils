import { AsyncAllIterableIterator } from "@code-engine/types";
import { demandIterator } from "./get-iterator";
import { iterateAll } from "./iterate-all";
import { pending, Pending } from "./pending";

/**
 * Debounces an async iterable, so all values that are yielded within a threshold are grouped together.
 */
export function debounceIterable<T>(iterable: AsyncIterable<T>, delay = 0): AsyncAllIterableIterator<T[]> {
  let iterator = demandIterator(iterable);
  let pendingRead: Pending<IteratorResult<T[]>> | undefined;
  let values: T[] = [];
  let done = false;
  let timeout: NodeJS.Timeout | undefined;

  // Start reading results from the iterator
  readNextResult();

  return {
    [Symbol.asyncIterator]() {
      return this;
    },

    all: iterateAll,

    // tslint:disable-next-line: promise-function-async
    async next() {
      let promise;

      if (pendingRead) {
        promise = pendingRead.promise;
      }
      else {
        pendingRead = pending();
        promise = pendingRead.promise;
      }

      if (values.length > 0) {
        debounce();
      }
      else if (done) {
        pendingRead.resolve({ done: true, value: undefined });
      }

      return promise;
    }
  };

  // Reads the next result from the iterator and processes it
  function readNextResult() {
    Promise.resolve().then(() => iterator.next()).then(onResult, onError);
  }

  // Process a result from the async iterator
  function onResult(result: IteratorResult<T>) {
    if (timeout) {
      // A new result arrived within the threshold time, so clear the timeout
      clearTimeout(timeout);
    }

    if (result.done) {
      done = true;

      if (pendingRead && values.length === 0) {
        pendingRead.resolve({ done: true, value: undefined });
      }
      else {
        debounce();
      }
    }
    else {
      values.push(result.value);
      timeout = setTimeout(debounce, delay);
      readNextResult();
    }
  }

  // This function is called whenever the debounce threshold has passed
  async function debounce() {
    timeout = undefined;

    // If there's a pending read, then fulfill it with all of the debounced values that have
    // been collected since the last read. If there's NOT a pending read, then just keep
    // collecting values for the next read.
    if (values.length > 0 && pendingRead) {
      let batch = values;
      values = [];
      let resolve = pendingRead.resolve;
      pendingRead = pending();
      resolve({ value: batch });
    }
  }

  // If the async iterator throws an error, then our iterable re-throws it
  function onError(error: Error) {
    if (!pendingRead) {
      pendingRead = pending();
    }

    pendingRead.reject(error);

    // Ensure that there's at least one rejection handler;
    // otherwise, Node will crash the process
    pendingRead.promise.catch(() => undefined);
  }
}
