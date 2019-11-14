"use strict";

const { iterate, joinIterables } = require("../../");
const { assert, expect } = require("chai");
const { delay, createIterator } = require("../utils");

// CI environments are slow, so use a larger time buffer
const TIME_BUFFER = process.env.CI ? 75 : 30;

describe("joinIterables() function", () => {

  it("should return an empty iterator if called with no arguments", async () => {
    let items = await joinIterables().all();
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should return an empty iterator if called with an empty array", async () => {
    let items = await joinIterables([]).all();
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should return each letter if called with strings", async () => {
    let items = await joinIterables("Hello", "World").all();
    expect(items).to.have.same.members(["H", "e", "l", "l", "o", "W", "o", "r", "l", "d"]);
  });

  it("should return an empty iterator if all sources are empty", async () => {
    let sources = [
      [],
      new Set(),
      new Map(),
      iterate(undefined),
    ];

    let items = await joinIterables(...sources).all();
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should iterate falsy values", async () => {
    let items = await joinIterables([undefined, null, NaN, 0, false, ""]).all();
    expect(items).to.deep.equal([undefined, null, NaN, 0, false, ""]);
  });

  it("should iterate iterables of truthy values", async () => {
    let items = await joinIterables([
      1, true, "hello", /^regex$/, { a: "b" }, new Date("2005-05-05T05:05:05.005Z")
    ]).all();

    expect(items).to.deep.equal([
      1, true, "hello", /^regex$/, { a: "b" }, new Date("2005-05-05T05:05:05.005Z"),
    ]);
  });

  it("should iterate different types of iterable values", async () => {
    let string = "123";
    let array = [1, 2, 3];
    let set = new Set([1, 2, 3]);
    let map = new Map([[1, "one"], [2, "two"], [3, "three"]]);
    let object = Object.entries({ one: 1, two: 2, three: 3 });
    let iterable = [1, 2, 3][Symbol.iterator]();
    function* generator () { yield 1; yield 2; yield 3; }

    let items = await joinIterables(string, array, set, map, object, iterable, generator()).all();

    expect(items).to.be.an("array").with.lengthOf(21);
    expect(items).to.have.same.deep.members([
      "1", "2", "3",
      1, 2, 3,
      1, 2, 3,
      [1, "one"], [2, "two"], [3, "three"],
      ["one", 1], ["two", 2], ["three", 3],
      1, 2, 3,
      1, 2, 3,
    ]);
  });

  it("should return all items, in order, from a single source", async () => {
    let source = createIterator([
      { value: 1 },
      { value: 2 },
      delay(50, { value: 3 }),
      { value: 4 },
    ]);

    let items = await joinIterables(source).all();

    expect(items).to.be.an("array").with.lengthOf(4);
    expect(items).to.deep.equal([1, 2, 3, 4]);
  });

  it("should return all items, in first-available order, from multiple sources", async () => {
    let source1 = createIterator([
      { value: 1 },
      delay(50, { value: 2 }),
      delay(100, { value: 3 }),
      { value: 4 },
    ]);
    let source2 = createIterator([
      { value: "a" },
      delay(50, { value: "b" }),
      { value: "c" },
      delay(100, { value: "d" }),
    ]);
    let source3 = createIterator([
      delay(0, { value: 101 }),
      delay(50, { value: 102 }),
      delay(100, { value: 103 }),
    ]);
    let source4 = createIterator([
      { value: "foo" },
      { value: "bar" },
      { value: "baz" },
    ]);

    let items = await joinIterables(source1, source2, source3, source4).all();

    expect(items).to.be.an("array").with.lengthOf(14);
    expect(items).to.deep.equal([
      1, "a", "foo", "bar", "baz", 101, 2, "b", "c", 102, 3, 4, "d", 103
    ]);
  });

  it("should return all items, in first-available order, from multiple sources, simultaneously", async () => {
    let source1 = createIterator([
      { value: 1 },
      delay(50, { value: 2 }),
      delay(100, { value: 3 }),
      { value: 4 },
    ]);
    let source2 = createIterator([
      { value: "a" },
      delay(50, { value: "b" }),
      { value: "c" },
      delay(100, { value: "d" }),
    ]);
    let source3 = createIterator([
      delay(0, { value: 101 }),
      delay(50, { value: 102 }),
      delay(100, { value: 103 }),
    ]);
    let source4 = createIterator([
      { value: "foo" },
      { value: "bar" },
      { value: "baz" },
    ]);

    let iterator = joinIterables(source1, source2, source3, source4)[Symbol.asyncIterator]();

    // Read all values (and more!) simultaneously
    let promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(iterator.next());
    }

    let items = await Promise.all(promises);

    expect(items).to.deep.equal([
      { value: 1 },
      { value: "a" },
      { value: "foo" },
      { value: "bar" },
      { value: "c" },
      { value: "baz" },
      { value: 4 },
      { value: 101 },
      { value: 2 },
      { value: "b" },
      { value: 102 },
      { value: 3 },
      { value: "d" },
      { value: 103 },
      { done: true, value: undefined },
      { done: true, value: undefined },
      { done: true, value: undefined },
      { done: true, value: undefined },
      { done: true, value: undefined },
      { done: true, value: undefined },
    ]);
  });

  it("should read values from the iterable as soon as next() is called", async () => {
    let startTime = Date.now();
    let callTimes = [];                                   // Keeps to rack of each time next() is called

    let slowIterator = {
      async next () {
        callTimes.push(Date.now() - startTime);           // Record the time that next() was called
        return await delay(100, { value: "Hi" });         // Each call to next() takes 100ms to resolve
      }
    };

    let iterator = joinIterables(slowIterator)[Symbol.asyncIterator]();

    // Read multiple values simultaneously
    let promise1 = iterator.next();
    let promise2 = iterator.next();
    let promise3 = iterator.next();

    await Promise.all([promise1, promise2, promise3]);

    // The time needed to resolve all three reads should be 100ms, NOT 300ms
    expect(Date.now() - startTime).to.be.at.least(100).and.below(100 + TIME_BUFFER);

    // All three values should have been read at roughly the same time
    expect(callTimes[0]).to.be.at.most(TIME_BUFFER);
    expect(callTimes[1]).to.be.at.most(TIME_BUFFER);
    expect(callTimes[1]).to.be.at.most(TIME_BUFFER);
  });

  it("should read values from all iterables simultaneously", async () => {
    let startTime = Date.now();
    let slowCallTimes = [], slowerCallTimes = [];         // Keeps to rack of each time next() is called

    let slowIterator = {
      async next () {
        slowCallTimes.push(Date.now() - startTime);       // Record the time that next() was called
        return await delay(100, { value: "A" });          // Each call to next() takes 100ms to resolve
      }
    };

    let slowerIterator = {
      async next () {
        slowerCallTimes.push(Date.now() - startTime);     // Record the time that next() was called
        return await delay(500, { value: "B" });          // Each call to next() takes 500ms to resolve
      }
    };

    let iterator = joinIterables(slowIterator, slowerIterator)[Symbol.asyncIterator]();

    // Read a single value
    let result = await iterator.next();
    expect(result.value).to.equal("A");
    expect(Date.now() - startTime).to.be.at.least(100).and.below(100 + TIME_BUFFER);

    // Both iterators should have been called once, at the same time
    expect(slowCallTimes).to.have.lengthOf(1);
    expect(slowCallTimes[0]).to.be.at.most(TIME_BUFFER);

    expect(slowerCallTimes).to.have.lengthOf(1);
    expect(slowerCallTimes[0]).to.be.at.most(TIME_BUFFER);

    // Read another value
    result = await iterator.next();
    expect(result.value).to.equal("A");
    expect(Date.now() - startTime).to.be.at.least(200).and.below(200 + TIME_BUFFER);

    // The first iterator should have been called a second time
    expect(slowCallTimes).to.have.lengthOf(2);
    expect(slowCallTimes[1]).to.be.at.least(100).and.at.most(100 + TIME_BUFFER);

    // The second iterator should NOT have been called again
    expect(slowerCallTimes).to.have.lengthOf(1);
  });

  it("should throw an error if called with a non-iterable value", async () => {
    try {
      joinIterables(12345);
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("12345 is not iterable.");
    }
  });

  it("should throw an error if an iterable returns an invalid result", async () => {
    let badIterator = {
      next () {
        return null;
      }
    };

    try {
      await joinIterables(badIterator).all();
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Cannot read property 'done' of null");
    }
  });

  it("should throw an error if called with a mix of iterable and non-iterable values", async () => {
    try {
      joinIterables("hello", [1, 2, 3], /regex/);
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("/regex/ is not iterable.");
    }
  });

  it("should throw an error if called with a Promise", async () => {
    try {
      joinIterables(Promise.resolve([1, 2, 3]));
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("A Promise is not iterable.");
    }
  });

  it("should propagate errors from iterables", async () => {
    let source1 = [1, 2, 3];

    function* source2 () {
      yield 1;
      yield 2;
      throw new TypeError("Boom!");
    }

    let iterable = await joinIterables(source1, source2());

    try {
      await iterable.all();
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Boom!");
    }
  });

  it("should propagate errors from async iterables", async () => {
    let source1 = [1, 2, 3];

    async function* source2 () {
      yield 1;
      delay(50);
      yield 2;
      delay(50);
      throw new TypeError("Boom!");
    }

    let iterable = await joinIterables(source1, source2());

    try {
      await iterable.all();
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Boom!");
    }
  });

  it("should propagate errors that occur after reads", async () => {
    async function* source () {
      yield 1;
      delay(50);
      yield 2;
      delay(50);
      throw new TypeError("Boom!");
    }

    let iterable = await joinIterables(source());

    let one = iterable.next();
    let two = iterable.next();
    let three = iterable.next();

    expect(await one).to.deep.equal({ value: 1 });
    expect(await two).to.deep.equal({ value: 2 });

    try {
      await three;
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Boom!");
    }
  });

});
