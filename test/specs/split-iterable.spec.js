"use strict";

const { iterate, splitIterable } = require("../../");
const { assert, expect } = require("chai");

describe("splitIterable() function", () => {

  it("should return as many iterables as specified", async () => {
    function isArrayOfIterables (array) {
      expect(array).to.be.an("array");
      for (let it of array) {
        expect(it).to.be.an("object").with.keys(Symbol.asyncIterator, "all");
        expect(it[Symbol.asyncIterator]).to.be.a("function");
        expect(it.all).to.be.a("function");
      }
      return true;
    }

    expect(splitIterable(iterate([]), 1)).to.have.lengthOf(1).and.satisfy(isArrayOfIterables);
    expect(splitIterable(iterate([]), 10)).to.have.lengthOf(10).and.satisfy(isArrayOfIterables);
    expect(splitIterable(iterate([]), 1000)).to.have.lengthOf(1000).and.satisfy(isArrayOfIterables);
  });

  it("should iterate an empty set", async () => {
    let iterables = splitIterable(iterate([]), 5);
    expect(await iterables[0].all()).to.deep.equal([]);
    expect(await iterables[1].all()).to.deep.equal([]);
    expect(await iterables[2].all()).to.deep.equal([]);
    expect(await iterables[3].all()).to.deep.equal([]);
    expect(await iterables[4].all()).to.deep.equal([]);
  });

  it("should send all values to the first iterable that reads them", async () => {
    let iterables = splitIterable(iterate("abcdefghijklmnopqrstuvwxyz"), 3);

    expect(await iterables[0].all()).to.deep.equal([
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n",
      "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ]);

    expect(await iterables[1].all()).to.deep.equal([]);
    expect(await iterables[2].all()).to.deep.equal([]);
  });

  it("should send each value to only one iterable", async () => {
    let iterables = splitIterable(iterate("abcdefghijklmnopqrstuvwxyz"), 3);

    let values = await Promise.all(iterables.map((it) => it.all()));

    expect(values[0]).to.deep.equal(["a", "d", "g", "j", "m", "p", "s", "v", "y"]);
    expect(values[1]).to.deep.equal(["b", "e", "h", "k", "n", "q", "t", "w", "z"]);
    expect(values[2]).to.deep.equal(["c", "f", "i", "l", "o", "r", "u", "x"]);
  });

  it("should send values to each iterable at the rate that they're requested", async () => {
    let iterables = splitIterable(iterate("0123456789"), 3);

    async function delayedReader (iterable, delay) {
      let values = [];
      for await (let value of iterable) {
        values.push(value);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      return values;
    }

    let values = await Promise.all([
      delayedReader(iterables[0], 200),
      delayedReader(iterables[1], 350),
      delayedReader(iterables[2], 550),
    ]);

    expect(values[0]).to.deep.equal(["0", "3", "5", "7", "9"]);
    expect(values[1]).to.deep.equal(["1", "4", "8"]);
    expect(values[2]).to.deep.equal(["2", "6"]);
  });

  it("should throw an error if called with no args", async () => {
    try {
      splitIterable();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Undefined is not an async iterator.");
    }
  });

  it("should throw an error if called with a non-async iterable", async () => {
    try {
      splitIterable([1, 2, 3]);
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("1,2,3 is not an async iterator.");
    }
  });

  it("should throw an error if called with a Promise", async () => {
    try {
      await splitIterable(Promise.resolve()).all();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("A Promise is not an async iterator.");
    }
  });

});
