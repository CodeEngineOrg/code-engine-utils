"use strict";

const { IterableWriter } = require("../../");
const { assert, expect } = require("chai");
const { delay, iterateAll } = require("../utils");
const sinon = require("sinon");

// CI environments are slow, so use a larger time buffer
const TIME_BUFFER = process.env.CI ? 150 : 50;

describe("IterableWriter class", () => {

  function delayedRead (writer, _delay = 200) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(iterateAll(writer.iterable)), _delay);
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
    writer.onRead = sinon.spy();
    let items = iterateAll(writer.iterable);
    await writer.end();

    expect(await items).to.deep.equal([]);
    sinon.assert.calledOnce(writer.onRead);
  });

  it("should iterate an empty set that's ended before the first read", async () => {
    let writer = new IterableWriter();
    writer.onRead = sinon.spy();
    let items = delayedRead(writer);
    await writer.end();

    expect(await items).to.deep.equal([]);
    sinon.assert.notCalled(writer.onRead);
  });

  it("should iterate a single item", async () => {
    let writer = new IterableWriter();
    writer.onRead = sinon.spy();
    let items = iterateAll(writer.iterable);

    await writer.write("Hello, world");
    await writer.end();

    expect(await items).to.deep.equal(["Hello, world"]);
    sinon.assert.calledTwice(writer.onRead);
  });

  it("should iterate a single item when ended before the first read", async () => {
    let writer = new IterableWriter();
    writer.onRead = sinon.spy();
    let items = delayedRead(writer);

    writer.write("Hello, world");
    writer.end();

    expect(await items).to.deep.equal(["Hello, world"]);
    sinon.assert.notCalled(writer.onRead);
  });

  it("should iterate a single item written by the onRead event handler", async () => {
    let values = ["Hello, world"];

    function onRead () {
      let value = values.shift();
      if (value) {
        writer.write(value);
      }
      else {
        writer.end();
      }
    }

    let writer = new IterableWriter();
    writer.onRead = onRead;
    let items = iterateAll(writer.iterable);

    expect(await items).to.deep.equal(["Hello, world"]);
  });

  it("should iterate multiple items", async () => {
    let writer = new IterableWriter();
    writer.onRead = sinon.spy();
    let items = iterateAll(writer.iterable);

    await writer.write("Fred");
    await writer.write("Wilma");
    await writer.write("Barney");
    await writer.write("Betty");
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
    sinon.assert.callCount(writer.onRead, 5);
  });

  it("should iterate multiple items when ended before the first read", async () => {
    let writer = new IterableWriter();
    writer.onRead = sinon.spy();
    let items = delayedRead(writer);

    writer.write("Fred");
    writer.write("Wilma");
    writer.write("Barney");
    writer.write("Betty");
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
    sinon.assert.notCalled(writer.onRead);
  });

  it("should iterate multiple items written by the onRead event handler", async () => {
    let values = ["Fred", "Wilma", "Barney", "Betty"];

    function onRead () {
      let value = values.shift();
      if (value) {
        writer.write(value);
      }
      else {
        writer.end();
      }
    }

    let writer = new IterableWriter();
    writer.onRead = onRead;
    let items = iterateAll(writer.iterable);

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
  });

  it("should iterate multiple items when some values are written before/after the first read", async () => {
    let writer = new IterableWriter();
    writer.onRead = sinon.spy();
    let items = delayedRead(writer);

    writer.write("Fred");
    writer.write("Wilma");
    writer.write("Barney");
    writer.write("Betty");
    sinon.assert.notCalled(writer.onRead);

    await delay(200);

    await writer.write("Pebbles");
    await writer.write("Bam Bam");
    await writer.end();
    sinon.assert.calledThrice(writer.onRead);

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty", "Pebbles", "Bam Bam"]);
  });

  it("should iterate multiple items when some values are read before/after being written", async () => {
    let writer = new IterableWriter();

    let fred = writer.iterable.next();
    let wilma = writer.iterable.next();
    let barney = writer.iterable.next();

    writer.write("Fred");
    writer.write("Wilma");
    writer.write("Barney");
    writer.write("Pebbles");
    writer.write("Betty");

    let pebbles = writer.iterable.next();

    writer.write("Dino");
    writer.write("Bam Bam");
    writer.end();

    let betty = writer.iterable.next();
    let dino = writer.iterable.next();
    let bambam = writer.iterable.next();
    let done1 = writer.iterable.next();
    let done2 = writer.iterable.next();

    expect(await fred).to.deep.equal({ value: "Fred" });
    expect(await wilma).to.deep.equal({ value: "Wilma" });
    expect(await barney).to.deep.equal({ value: "Barney" });
    expect(await pebbles).to.deep.equal({ value: "Pebbles" });
    expect(await betty).to.deep.equal({ value: "Betty" });
    expect(await dino).to.deep.equal({ value: "Dino" });
    expect(await bambam).to.deep.equal({ value: "Bam Bam" });
    expect(await done1).to.deep.equal({ done: true, value: undefined });
    expect(await done2).to.deep.equal({ done: true, value: undefined });
  });

  it("should return done if read again after finished", async () => {
    let writer = new IterableWriter();
    let items = iterateAll(writer.iterable);

    await writer.write("Fred");
    await writer.write("Wilma");
    await writer.write("Barney");
    await writer.write("Betty");
    await writer.end();

    expect(await items).to.deep.equal(["Fred", "Wilma", "Barney", "Betty"]);
    expect(await writer.iterable.next()).to.deep.equal({ done: true, value: undefined });
    expect(await writer.iterable.next()).to.deep.equal({ done: true, value: undefined });
  });

  it("should NOT call the onRead event handler if read again after finished", async () => {
    let writer = new IterableWriter();
    writer.onRead = sinon.spy();
    iterateAll(writer.iterable);

    await writer.write("Fred");
    await writer.write("Wilma");
    await writer.write("Barney");
    await writer.write("Betty");
    await writer.end();

    sinon.assert.callCount(writer.onRead, 5);

    await writer.end();
    await writer.end();
    await writer.end();

    sinon.assert.callCount(writer.onRead, 5);
  });

  it("should not resolve promises (promise values should be resolved before calling write())", async () => {
    let writer = new IterableWriter();
    let items = iterateAll(writer.iterable);

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

  it("should call the onRead event handler as soon as next() is called", async () => {
    let startTime = Date.now();
    let callTimes = [];                                   // Keeps track of each time onRead() is called

    async function onRead () {
      callTimes.push(Date.now() - startTime);             // Record the time that onRead() was called
      await delay(100);                                   // Wait 100ms before writing a value
      writer.write("Hello, world");
    }

    let writer = new IterableWriter();
    let iterator = writer.iterable[Symbol.asyncIterator]();
    writer.onRead = onRead;

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
    let items = iterateAll(writer.iterable);

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
    let items = iterateAll(writer.iterable);

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

  it("should not allow the onRead handler to be overwritten with another handler", async () => {
    let writer = new IterableWriter();
    writer.onRead = sinon.spy();

    // The handler can be set if cleared first
    writer.onRead = null;
    writer.onRead = sinon.spy();

    writer.onRead = undefined;
    writer.onRead = sinon.spy();

    try {
      // But trying to set it when it's already set will throw an error
      writer.onRead = sinon.spy();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal('Only one "onRead" event handler is allowed.');
    }
  });

});
