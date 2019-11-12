"use strict";

const { drainIterable } = require("../../");
const { assert, expect } = require("chai");
const { delay } = require("../utils");
const sinon = require("sinon");

describe("drainIterable() function", () => {

  function asyncIterableSpy (values = []) {
    let index = 0;
    return {
      [Symbol.asyncIterator]: sinon.stub().returnsThis(),
      next: sinon.spy(() => {
        if (index >= values.length) {
          return { done: true };
        }
        return { value: values[index++] };
      })
    };
  }

  for (let concurrency of [undefined, 1, 3, 5, 10]) {
    describe(`concurrency: ${concurrency}`, () => {

      it("should iterate over an empty iterable", async () => {
        let spy = asyncIterableSpy([]);
        let result = await drainIterable(spy, concurrency);

        expect(result).to.equal(undefined);
        sinon.assert.calledOnce(spy[Symbol.asyncIterator]);
        expect(spy.next.callCount).to.be.at.least(1);
      });

      it("should iterate over a single-value iterable", async () => {
        let spy = asyncIterableSpy([1]);
        let result = await drainIterable(spy, concurrency);

        expect(result).to.equal(undefined);
        sinon.assert.calledOnce(spy[Symbol.asyncIterator]);
        expect(spy.next.callCount).to.be.at.least(2);
      });

      it("should iterate over a multi-value iterable", async () => {
        let spy = asyncIterableSpy([1, 2, 3]);
        let result = await drainIterable(spy, concurrency);

        expect(result).to.equal(undefined);
        sinon.assert.calledOnce(spy[Symbol.asyncIterator]);
        expect(spy.next.callCount).to.be.at.least(4);
      });

      it("should iterate over a non-async iterable", async () => {
        await drainIterable([1, 2, 3], concurrency);
      });

      it("should throw an error if called with no arguments", async () => {
        try {
          await drainIterable();
          assert.fail("An error should have been thrown");
        }
        catch (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          expect(error.message).to.equal("Undefined is not iterable.");
        }
      });

      it("should throw an error if called with a non-iterable argument", async () => {
        try {
          await drainIterable(12345);
          assert.fail("An error should have been thrown");
        }
        catch (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          expect(error.message).to.equal("12345 is not iterable.");
        }
      });

      it("should throw an error if called with a Promise", async () => {
        try {
          await drainIterable(Promise.resolve([1, 2, 3]));
          assert.fail("An error should have been thrown.");
        }
        catch (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          expect(error.message).to.equal("A Promise is not iterable.");
        }
      });

      it("should throw an error if called with an invalid iterable", async () => {
        try {
          await drainIterable({ [Symbol.asyncIterator]: () => undefined }, concurrency);
          assert.fail("An error should have been thrown");
        }
        catch (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          expect(error.message).to.equal("{} is not iterable.");
        }
      });

      it("should propagate errors from iterables", async () => {
        async function* source () {
          yield 1;
          await delay(50);
          yield 2;
          await delay(50);
          throw new TypeError("Boom!");
        }

        try {
          await drainIterable(source(), concurrency);
          assert.fail("An error should have been thrown.");
        }
        catch (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          expect(error.message).to.equal("Boom!");
        }
      });
    });
  }
});
