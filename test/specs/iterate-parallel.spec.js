"use strict";

const { iterateParallel } = require("../../");
const { assert, expect } = require("chai");
const { delay } = require("../utils");

// CI environments are slow, so use a larger buffer
const TIME_BUFFER = process.env.CI ? 100 : 30;

describe("iterateParallel() function", () => {

  function slowIterable (text) {
    let char = 0;
    return {
      async next () {
        if (char < text.length) {
          return delay(50, { value: text[char++] });
        }
        else {
          return delay(50, { done: true });
        }
      }
    };
  }

  it("should iterate an empty iterable", async () => {
    let startTime = Date.now();

    let items = [];
    for await (let item of iterateParallel(slowIterable(""), 5)) {
      items.push(item);
    }

    expect(items).to.have.lengthOf(0);
    expect(Date.now() - startTime).to.be.at.least(50).and.at.most(50 + TIME_BUFFER);
  });

  it("should iterate a single item", async () => {
    let startTime = Date.now();

    let items = [];
    for await (let item of iterateParallel(slowIterable("A"), 5)) {
      items.push(item);
    }

    expect(items).to.deep.equal(["A"]);
    expect(Date.now() - startTime).to.be.at.least(100).and.at.most(100 + TIME_BUFFER);
  });

  it("should iterate fewer items than the concurrency limit", async () => {
    let startTime = Date.now();

    let items = [];
    for await (let item of iterateParallel(slowIterable("ABC"), 5)) {
      items.push(item);
    }

    expect(items).to.deep.equal(["A", "B", "C"]);
    expect(Date.now() - startTime).to.be.at.least(100).and.at.most(100 + TIME_BUFFER);
  });

  it("should iterate more items than the concurrency limit", async () => {
    let startTime = Date.now();

    let items = [];
    for await (let item of iterateParallel(slowIterable("123456789"), 3)) {
      items.push(item);
    }

    expect(items).to.deep.equal(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    expect(Date.now() - startTime).to.be.at.least(200).and.at.most(200 + TIME_BUFFER);
  });

  it("should throw an error if called with no arguments", async () => {
    try {
      iterateParallel();
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Undefined is not iterable.");
    }
  });

  it("should throw an error if called with a non-iterable argument", async () => {
    try {
      iterateParallel(12345);
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("12345 is not iterable.");
    }
  });

  it("should throw an error if called with a Promise", async () => {
    try {
      iterateParallel(Promise.resolve([]));
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("A Promise is not iterable.");
    }
  });

  it("should throw an error if no concurrency value is specified", async () => {
    try {
      iterateParallel([]);
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Invalid concurrency: undefined. A value is required.");
    }
  });

  it("should throw an error if an invalid concurrency value is specified", async () => {
    try {
      iterateParallel([], 1.234);
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Invalid concurrency: 1.234. Expected an integer.");
    }
  });

});
