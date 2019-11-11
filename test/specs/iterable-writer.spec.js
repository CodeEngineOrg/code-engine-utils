"use strict";

const { IterableWriter } = require("../../");
const { assert, expect } = require("chai");
const delayed = require("../utils/delayed");

describe("IterableWriter class", () => {

  function delayedRead (writer, delay = 200) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(writer.iterable.all()), delay);
    });
  }

  it("can be called with new", () => {
    let writer = new IterableWriter();
    expect(writer).to.be.an.instanceOf(IterableWriter);
  });

  it("cannot be called as a function", () => {
    try {
      // eslint-disable-next-line new-cap
      IterableWriter();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal("Class constructor IterableWriter cannot be invoked without 'new'");
    }
  });

  it("should iterate an empty set", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();
    await writer.end();
    expect(await items).to.deep.equal([]);
  });

  it("should iterate an empty set that's ended before the first read", async () => {
    let writer = new IterableWriter();
    let items = delayedRead(writer);
    await writer.end();
    expect(await items).to.deep.equal([]);
  });

  it("should iterate a single item", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();

    await writer.write("Hello, world");
    await writer.end();

    expect(await items).to.deep.equal(["Hello, world"]);
  });

  it("should iterate a single item when ended before the first read", async () => {
    let writer = new IterableWriter();
    let items = delayedRead(writer);

    writer.write("Hello, world");
    writer.end();

    expect(await items).to.deep.equal(["Hello, world"]);
  });

  it("should iterate a single item from a source", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();

    writer.writeFrom(["Hello, world"]);
    await writer.end();

    expect(await items).to.deep.equal(["Hello, world"]);
  });

  it("should iterate a single item from a source when ended before the first read", async () => {
    let writer = new IterableWriter();
    let items = delayedRead(writer);

    writer.writeFrom(["Hello, world"]);
    writer.end();

    expect(await items).to.deep.equal(["Hello, world"]);
  });

  it("should iterate multiple items", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();

    await writer.write("Fred");
    await writer.write("Wilma");
    await writer.write("Barney");
    await writer.write("Betty");
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
  });

  it("should iterate multiple items when ended before the first read", async () => {
    let writer = new IterableWriter();
    let items = delayedRead(writer);

    writer.write("Fred");
    writer.write("Wilma");
    writer.write("Barney");
    writer.write("Betty");
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
  });

  it("should iterate multiple items from a source", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();

    writer.writeFrom(["Fred", "Wilma", "Barney", "Betty"]);
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
  });

  it("should iterate multiple items from a source when ended before the first read", async () => {
    let writer = new IterableWriter();
    let items = delayedRead(writer);

    writer.writeFrom(["Fred", "Wilma", "Barney", "Betty"]);
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
  });

  it("should iterate multiple items when some values are written before/after the first read", async () => {
    let writer = new IterableWriter();
    let items = delayedRead(writer);

    writer.write("Fred");
    writer.writeFrom(["Wilma", "Barney"]);
    writer.write("Betty");

    await delayed(undefined, 200);

    await writer.write("Pebbles");
    await writer.writeFrom(["Bam Bam"]);
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Betty", "Wilma", "Barney", "Pebbles", "Bam Bam"]);
  });

  it("should iterate multiple items when some values are read before/after being written", async () => {
    let writer = new IterableWriter();

    let fred = writer.iterable.next();
    let betty = writer.iterable.next();
    let bambam = writer.iterable.next();

    writer.write("Fred");
    writer.writeFrom(["Wilma", "Barney"]);
    writer.write("Betty");

    let wilma = writer.iterable.next();
    let pebbles = writer.iterable.next();

    writer.writeFrom(["Pebbles"]);
    writer.write("Bam Bam");
    writer.end();

    let barney = writer.iterable.next();
    let done1 = writer.iterable.next();
    let done2 = writer.iterable.next();

    expect(await fred).to.deep.equal({ value: "Fred" });
    expect(await betty).to.deep.equal({ value: "Betty" });
    expect(await bambam).to.deep.equal({ value: "Bam Bam" });
    expect(await wilma).to.deep.equal({ value: "Wilma" });
    expect(await pebbles).to.deep.equal({ value: "Pebbles" });
    expect(await barney).to.deep.equal({ value: "Barney" });
    expect(await done1).to.deep.equal({ done: true, value: undefined });
    expect(await done2).to.deep.equal({ done: true, value: undefined });
  });

  it("should return done if read again after finished", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();

    await writer.write("Fred");
    await writer.write("Wilma");
    await writer.write("Barney");
    await writer.write("Betty");
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
    expect(await writer.iterable.next()).to.deep.equal({ done: true, value: undefined });
    expect(await writer.iterable.next()).to.deep.equal({ done: true, value: undefined });
  });

  it("should not resolve promises (promise values should be resolved before calling write())", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();

    let helloPromise = Promise.resolve("Hello, world");
    await writer.write(helloPromise);

    let goodbyePromise = delayed("Goodbye, world");
    await writer.write(goodbyePromise);

    await writer.end();

    expect(await items).to.deep.equal([helloPromise, goodbyePromise]);
  });

  it("should not resolve end() until all values are read", async () => {
    let writer = new IterableWriter();
    delayedRead(writer, 500);

    let beforeEnd = Date.now();
    await writer.end();
    let afterEnd = Date.now();

    expect(afterEnd).to.be.at.least(beforeEnd + 500);
  });

  it("should ignore multiple calls to end()", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();

    await writer.write("Fred");
    await writer.write("Wilma");
    await writer.write("Barney");
    await writer.write("Betty");
    await writer.end();
    await writer.end();
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
    expect(await writer.iterable.next()).to.deep.equal({ done: true, value: undefined });
    expect(await writer.iterable.next()).to.deep.equal({ done: true, value: undefined });
  });

  it("should not allow values to be written after end()", async () => {
    let writer = new IterableWriter();
    let items = writer.iterable.all();

    await writer.write("Fred");
    await writer.write("Wilma");
    await writer.write("Barney");
    await writer.write("Betty");
    await writer.end();

    try {
      await writer.write("Pebbles");
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal("Cannot write values after the iterator has ended.");
    }

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
    expect(await writer.iterable.next()).to.deep.equal({ done: true, value: undefined });
  });

  it("should throw an error a non-iterable value is passed to writeFrom()", async () => {
    let writer = new IterableWriter();

    try {
      writer.writeFrom(12345);
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("12345 is not iterable.");
    }
  });

  it("should throw an error if the iterable passed to writeFrom() returns an invalid result", async () => {
    let badIterator = {
      next () {
        return null;
      }
    };

    let writer = new IterableWriter();
    writer.writeFrom(badIterator);

    try {
      await writer.iterable.all();
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Cannot read property 'done' of null");
    }
  });

  it("should throw an error if a Promise is passed to writeFrom()", async () => {
    let writer = new IterableWriter();

    try {
      writer.writeFrom(Promise.resolve([1, 2, 3]));
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("A Promise is not iterable.");
    }
  });

});
