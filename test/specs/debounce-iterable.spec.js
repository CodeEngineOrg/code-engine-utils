"use strict";

const { debounceIterable } = require("../../");
const { assert, expect } = require("chai");
const delayed = require("../utils/delayed");

describe("debounceIterable() function", () => {

  it("should iterate over an empty iterable", async () => {
    let debounced = debounceIterable([]);
    let items = await debounced.all();

    expect(items).to.have.lengthOf(0);
  });

  it("should iterate over a single-value iterable", async () => {
    let debounced = debounceIterable(["Hello, world"]);
    let items = await debounced.all();

    expect(items).to.deep.equal([
      ["Hello, world"]
    ]);
  });

  it("should iterate over a delayed single-value iterable", async () => {
    async function* generator () {
      yield await delayed("Hello, world", 100);
    }

    let debounced = debounceIterable(generator(), 300);
    let items = await debounced.all();

    expect(items).to.deep.equal([
      ["Hello, world"]
    ]);
  });

  it("should iterate over a multi-value iterable", async () => {
    let debounced = debounceIterable("Hello, world");
    let items = await debounced.all();

    expect(items).to.deep.equal([
      ["H", "e", "l", "l", "o", ",", " ", "w", "o", "r", "l", "d"]
    ]);
  });

  it("should combine all values received until the next read", async () => {
    async function* generator () {
      yield* await delayed("Hello", 50);
      yield* await delayed("World", 50);
    }

    let debounced = debounceIterable(generator(), 300);
    let items = await debounced.all();

    expect(items).to.deep.equal([
      ["H", "e", "l", "l", "o", "W", "o", "r", "l", "d"]
    ]);
  });

  it("should combine all values that are yielded before the first read", async () => {
    async function* generator () {
      yield "Hello";
      yield* await delayed("World", 50);
      yield* await delayed([1, 2, 3], 50);
      yield* await delayed([4, 5, 6], 50);
    }

    let debounced = debounceIterable(generator(), 100);
    await delayed(null, 300);
    let items = await debounced.all();

    expect(items).to.deep.equal([
      ["Hello", "W", "o", "r", "l", "d", 1, 2, 3, 4, 5, 6],
    ]);
  });

  it("should yield values at the soonest possible read", async () => {
    async function* generator () {
      yield* await delayed("Hello", 300);
      yield* await delayed("World", 300);
    }

    let debounced = debounceIterable(generator(), 50);
    let items = await debounced.all();

    expect(items).to.deep.equal([
      ["H", "e", "l", "l", "o"],
      ["W", "o", "r", "l", "d"],
    ]);
  });

  it("should yield multiple batches of values", async () => {
    async function* generator () {
      yield "Hello";
      yield ", ";
      yield* await delayed("World", 150);
      yield "!";
      yield* await delayed([1, 2, 3], 300);
      yield* await delayed([4, 5, 6], 10);
      yield* [7, 8, 9];
      yield await delayed(10, 200);
    }

    let debounced = debounceIterable(generator(), 100);
    await delayed(null, 100);
    let items = await debounced.all();

    expect(items).to.deep.equal([
      ["Hello", ", "],
      ["W", "o", "r", "l", "d", "!"],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [10],
    ]);
  });

  it("should throw an error if called with no arguments", () => {
    try {
      debounceIterable();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Undefined is not iterable.");
    }
  });

  it("should throw an error if called with a non-iterable argument", () => {
    try {
      debounceIterable(12345);
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("12345 is not iterable.");
    }
  });

  it("should throw an error if called with a Promise", () => {
    try {
      debounceIterable(Promise.resolve([1, 2, 3]));
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("A Promise is not iterable.");
    }
  });

  it("should throw an error if called with an invalid iterable", () => {
    try {
      debounceIterable({ [Symbol.asyncIterator]: () => undefined });
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
      yield await delayed(2, 50);
      yield await delayed(3, 300);
      throw new TypeError("Boom!");
    }

    try {
      await debounceIterable(source(), 200).all();
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Boom!");
    }
  });

  it("should propagate errors from iterables that occur before the first read", async () => {
    async function* source () {
      yield 1;
      yield await delayed(2, 50);
      yield await delayed(3, 50);
      throw new TypeError("Boom!");
    }

    try {
      let debounced = debounceIterable(source(), 200);
      await delayed(null, 300);
      await debounced.all();
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Boom!");
    }
  });

});
