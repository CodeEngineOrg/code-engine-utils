/**
 * Returns a `Promise` and the `resolve()` function that resolves the promise.
 */
export function pending<T>(): Pending<T> {
  let resolve: Resolve<T>, reject: Reject;

  let promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: new Promise((r) => r(resolve)),
    reject: new Promise((r) => r(reject)),
  };
}

/**
 * A pending `Promise`, and the functions to resolve or reject it.
 */
export interface Pending<T> {
  promise: Promise<T>;
  resolve: Promise<Resolve<T>>;
  reject: Promise<Reject>;
}

/**
 * Resolves a Promise
 */
export type Resolve<T> = (result: T | PromiseLike<T>) => void;

/**
 * Rejects a promise
 */
export type Reject = (error: Error) => void;
