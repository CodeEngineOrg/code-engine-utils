/**
 * Returns a `Promise` and the functions to resolve or reject it.
 * @internal
 */
export function pending<T>(): Pending<T> {
  let resolve: Resolve<T>, reject: Reject;

  let promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    async resolve(result) {
      await Promise.resolve();
      resolve(result);
    },
    async reject(reason: Error) {
      await Promise.resolve();
      reject(reason);
    }
  };
}

/**
 * A pending `Promise`, and the functions to resolve or reject it.
 * @internal
 */
export interface Pending<T> {
  promise: Promise<T>;

  /**
   * Resolves the promise with the given value.
   */
  resolve(result: T | PromiseLike<T>): Promise<void>;

  /**
   * Rejects the promise with the given reason.
   */
  reject(reason: Error): Promise<void>;
}

type Resolve<T> = (result: T | PromiseLike<T>) => void;
type Reject = (error: Error) => void;
