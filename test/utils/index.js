"use strict";

module.exports = {
  /**
   * Returns a promise that resolves after the specified amount of time.
   *
   * @param timeout {number} - The number of milliseconds to delay
   * @param [result] {any} - The promise result
   */
  delay (timeout, result) {
    return new Promise((resolve) => setTimeout(() => resolve(result), timeout));
  },

  /**
   * Creates an iterator that returns the given sync or async results.
   */
  createIterator (results) {
    return {
      next () {
        return results.shift() || { done: true };
      }
    };
  },
};
