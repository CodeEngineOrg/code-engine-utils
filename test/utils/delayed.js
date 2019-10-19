"use strict";

module.exports = delayed;

/**
 * Helper function that returns the specified value after a delay.
 */
function delayed (value, delay = 50) {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}
