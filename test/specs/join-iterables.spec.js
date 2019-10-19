"use strict";

const { iterate, joinIterables } = require("../../");
const { assert, expect } = require("chai");
const delayed = require("../utils/delayed");

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
    let source = iterate([1, 2, delayed(3), 4]);
    let items = await joinIterables(source).all();

    expect(items).to.be.an("array").with.lengthOf(4);
    expect(items).to.deep.equal([1, 2, 3, 4]);
  });

  it("should return all items, in first-available order, from multiple sources", async () => {
    let source1 = iterate([1, delayed(2), delayed(3), 4]);
    let source2 = iterate(["a", delayed("b"), "c", delayed("d")]);
    let source3 = iterate([delayed(101, 0), delayed(102), delayed(103)]);
    let source4 = iterate(["foo", "bar", "baz"]);

    let items = await joinIterables(source1, source2, source3, source4).all();

    expect(items).to.be.an("array").with.lengthOf(14);
    expect(items).to.deep.equal([
      1, "a", "foo", "bar", "baz", 101, 2, 3, 4, "b", "c", "d", 102, 103
    ]);
  });

  it("should throw an error if called with a non-iterable value", async () => {
    try {
      joinIterables(12345);
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("[number] is not iterable.");
    }
  });

  it("should throw an error if called with a mix of iterable and non-iterable values", async () => {
    try {
      joinIterables("hello", [1, 2, 3], /regex/);
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("[RegExp] is not iterable.");
    }
  });

  it("should throw an error if called with a Promise", async () => {
    try {
      joinIterables(Promise.resolve([1, 2, 3]));
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("[Promise] is not iterable.");
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
      delayed();
      yield 2;
      delayed();
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
      delayed();
      yield 2;
      delayed();
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
