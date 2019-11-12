"use strict";

const { debounceIterable } = require("../../");
const { assert, expect } = require("chai");
const { delay } = require("../utils");

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
      yield await delay(100, "Hello, world");
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
      yield* await delay(50, "Hello");
      yield* await delay(50, "World");
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
      yield* await delay(50, "World");
      yield* await delay(50, [1, 2, 3]);
      yield* await delay(50, [4, 5, 6]);
    }

    let debounced = debounceIterable(generator(), 100);
    await delay(300);
    let items = await debounced.all();

    expect(items).to.deep.equal([
      ["Hello", "W", "o", "r", "l", "d", 1, 2, 3, 4, 5, 6],
    ]);
  });

  it("should yield values at the soonest possible read", async () => {
    async function* generator () {
      yield* await delay(300, "Hello");
      yield* await delay(300, "World");
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
      yield* await delay(150, "World");
      yield "!";
      yield* await delay(300, [1, 2, 3]);
      yield* await delay(10, [4, 5, 6]);
      yield* [7, 8, 9];
      yield await delay(200, 10);
    }

    let debounced = debounceIterable(generator(), 100);
    await delay(100);
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
      yield await delay(50, 2);
      yield await delay(300, 3);
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
      yield await delay(50, 2);
      yield await delay(50, 3);
      throw new TypeError("Boom!");
    }

    try {
      let debounced = debounceIterable(source(), 200);
      await delay(300);
      await debounced.all();
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Boom!");
    }
  });

});
