"use strict";

const { IterableWriter } = require("../../");
const { assert, expect } = require("chai");
const { delay, createIterator } = require("../utils");

describe("IterableWriter class", () => {

  function delayedRead (writer, _delay = 200) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(writer.iterable.all()), _delay);
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

    await delay(200);

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
    writer.writeFrom(["Wilma", "Barney", "Pebbles"]);
    writer.write("Betty");

    let wilma = writer.iterable.next();
    let barney = writer.iterable.next();

    writer.writeFrom(["Dino"]);
    writer.write("Bam Bam");
    writer.end();

    let pebbles = writer.iterable.next();
    let dino = writer.iterable.next();
    let done1 = writer.iterable.next();
    let done2 = writer.iterable.next();

    expect(await fred).to.deep.equal({ value: "Fred" });
    expect(await betty).to.deep.equal({ value: "Betty" });
    expect(await bambam).to.deep.equal({ value: "Bam Bam" });
    expect(await wilma).to.deep.equal({ value: "Wilma" });
    expect(await barney).to.deep.equal({ value: "Barney" });
    expect(await pebbles).to.deep.equal({ value: "Pebbles" });
    expect(await dino).to.deep.equal({ value: "Dino" });
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

    let goodbyePromise = delay(50, "Goodbye, world");
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

  it("should read values from sources in first-available order", async () => {
    let source1 = createIterator([
      { value: 1 },
      delay(50, { value: 2 }),
      delay(50, { value: 3 }),
      { value: 4 },
    ]);
    let source2 = createIterator([
      { value: "a" },
      delay(50, { value: "b" }),
      { value: "c" },
      delay(50, { value: "d" }),
    ]);
    let source3 = createIterator([
      delay(0, { value: 101 }),
      delay(50, { value: 102 }),
      delay(50, { value: 103 }),
    ]);
    let source4 = createIterator([
      { value: "foo" },
      { value: "bar" },
      { value: "baz" },
    ]);

    let writer = new IterableWriter();
    writer.writeFrom(source1);
    writer.writeFrom(source2);
    writer.writeFrom(source3);
    writer.writeFrom(source4);
    writer.end();

    let items = await writer.iterable.all();

    expect(items).to.be.an("array").with.lengthOf(14);
    expect(items).to.deep.equal([
      1, "a", "foo", "bar", "baz", 101, 2, 4, "c", 3, "b", "d", 102, 103
    ]);
  });

  it("should read values from sources as soon as next() is called", async () => {
    const TIME_BUFFER = process.env.CI ? 75 : 25;         // CI environments are slow, so use a larger time buffer
    let startTime = Date.now();
    let callTimes = [];                                   // Keeps to rack of each time next() is called

    let slowIterator = {
      async next () {
        callTimes.push(Date.now() - startTime);           // Record the time that next() was called
        return await delay(100, { value: null });         // Each call to next() takes 100ms to resolve
      }
    };

    let writer = new IterableWriter();
    let iterator = writer.iterable[Symbol.asyncIterator]();
    writer.writeFrom(slowIterator);

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
