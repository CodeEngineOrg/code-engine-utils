"use strict";

const { iterate } = require("../../");
const { assert, expect } = require("chai");
const { delay } = require("../utils");

// CI environments are slow, so use a larger time buffer
const TIME_BUFFER = process.env.CI ? 75 : 30;

describe("iterate() function", () => {

  it("should return an empty iterator if called with no args", async () => {
    let items = await iterate().all();
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should return an empty iterator if called with undefined", async () => {
    let items = await iterate(undefined).all();
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should return an empty iterator if called with a void Promise", async () => {
    let items = await iterate(Promise.resolve()).all();
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should return the same instance if called multiple times", async () => {
    let iterable1 = await iterate([]);
    let iterable2 = await iterate(iterable1);
    expect(iterable1).to.equal(iterable2);
  });

  it("should NOT return the same instance if called with a different async iterable", async () => {
    async function* generator () {
      yield 1;
    }

    let iterable1 = generator();
    let iterable2 = await iterate(iterable1);

    expect(iterable1).not.to.equal(iterable2);
  });

  it("should iterate a single falsy primitive", async () => {
    let items = await iterate(null).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([null]);

    items = await iterate(Promise.resolve(null)).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([null]);

    items = await iterate(false).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([false]);

    items = await iterate(Promise.resolve(false)).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([false]);

    items = await iterate(0).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([0]);

    items = await iterate(Promise.resolve(0)).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([0]);

    items = await iterate("").all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([""]);

    items = await iterate(Promise.resolve("")).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([""]);
  });

  it("should iterate a single truthy primitive", async () => {
    let items = await iterate("a").all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal(["a"]);

    items = await iterate(Promise.resolve("b")).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal(["b"]);

    items = await iterate(true).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([true]);

    items = await iterate(Promise.resolve(true)).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([true]);

    items = await iterate(42).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([42]);

    items = await iterate(Promise.resolve(-42)).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([-42]);
  });

  it("should iterate a single object", async () => {
    let items = await iterate({}).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([{}]);

    items = await iterate(Promise.resolve({ foo: "bar" })).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([{ foo: "bar" }]);

    items = await iterate(new Date("2005-05-05T05:05:05.005Z")).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([new Date("2005-05-05T05:05:05.005Z")]);

    items = await iterate(Promise.resolve(/^regex$/)).all();
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([/^regex$/]);
  });

  it("should iterate a string", async () => {
    let items = await iterate("hello").all();
    expect(items).to.be.an("array").with.lengthOf(5);
    expect(items).to.deep.equal(["h", "e", "l", "l", "o"]);

    items = await iterate(Promise.resolve("world")).all();
    expect(items).to.be.an("array").with.lengthOf(5);
    expect(items).to.deep.equal(["w", "o", "r", "l", "d"]);
  });

  it("should iterate an array", async () => {
    let items = await iterate(["hello", "world"]).all();
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items).to.deep.equal(["hello", "world"]);

    items = await iterate(Promise.resolve([1, 2, 3])).all();
    expect(items).to.be.an("array").with.lengthOf(3);
    expect(items).to.deep.equal([1, 2, 3]);

    items = await iterate(Promise.resolve([{ name: "Fred" }, { name: "Barney" }])).all();
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items).to.deep.equal([{ name: "Fred" }, { name: "Barney" }]);
  });

  it("should iterate an array of Promises", async () => {
    let items = await iterate([Promise.resolve("hello"), Promise.resolve("world")]).all();
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items[0]).to.be.a("Promise");
    expect(items[1]).to.be.a("Promise");
    expect(await Promise.all(items)).to.deep.equal(["hello", "world"]);

    items = await iterate(Promise.resolve([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])).all();
    expect(items).to.be.an("array").with.lengthOf(3);
    expect(items[0]).to.be.a("Promise");
    expect(items[1]).to.be.a("Promise");
    expect(items[2]).to.be.a("Promise");
    expect(await Promise.all(items)).to.deep.equal([1, 2, 3]);

    items = await iterate([Promise.resolve({ name: "Fred" }), Promise.resolve({ name: "Barney" })]).all();
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items[0]).to.be.a("Promise");
    expect(items[1]).to.be.a("Promise");
    expect(await Promise.all(items)).to.deep.equal([{ name: "Fred" }, { name: "Barney" }]);
  });

  it("should iterate a generator", async () => {
    function* helloWorld () {
      yield "hello";
      yield "world";
    }

    let items = await iterate(helloWorld()).all();
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items).to.deep.equal(["hello", "world"]);
  });

  it("should iterate a Promise generator", async () => {
    function* counter () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }

    let items = await iterate(counter()).all();
    expect(items).to.be.an("array").with.lengthOf(3);
    expect(items[0]).to.be.a("Promise");
    expect(items[1]).to.be.a("Promise");
    expect(items[2]).to.be.a("Promise");
    expect(await Promise.all(items)).to.deep.equal([1, 2, 3]);
  });

  it("should iterate an async generator", async () => {
    async function* getPeople () {
      yield { firstName: "Fred", lastName: "Flintstone" };
      yield { firstName: "Barney", lastName: "Rubble" };
    }

    let items = await iterate(getPeople()).all();
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items).to.deep.equal([
      { firstName: "Fred", lastName: "Flintstone" },
      { firstName: "Barney", lastName: "Rubble" }
    ]);
  });

  it("should iterate an async generator of Promises", async () => {
    async function* getObjects () {
      yield Promise.resolve(new Date("2005-05-05T05:05:05.005Z"));
      yield Promise.resolve(/^regex$/);
      yield Promise.resolve(["hello", "world"]);
    }

    let items = await iterate(getObjects()).all();
    expect(items).to.be.an("array").with.lengthOf(3);
    expect(items).to.deep.equal([
      new Date("2005-05-05T05:05:05.005Z"),
      /^regex$/,
      ["hello", "world"],
    ]);
  });

  it("should iterate an iterator", async () => {
    let counter = 0;
    let iterator = {
      next () {
        return {
          value: ++counter,
          done: counter > 5
        };
      }
    };

    let items = await iterate(iterator).all();
    expect(items).to.be.an("array").with.lengthOf(5);
    expect(items).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it("should iterate a Promise iterator", async () => {
    let index = 0;
    let people = [
      { firstName: "Fred", lastName: "Flintstone" },
      { firstName: "Wilma", lastName: "Flintstone" },
      { firstName: "Pebbles", lastName: "Flintstone" },
      { firstName: "Barney", lastName: "Rubble" },
      { firstName: "Betty", lastName: "Rubble" },
      { firstName: "Bam Bam", lastName: "Rubble" },
    ];

    let iterator = {
      next () {
        let person = people[index++];
        return {
          value: Promise.resolve(person),
          done: index > people.length
        };
      }
    };

    let items = await iterate(iterator).all();
    expect(items).to.be.an("array").with.lengthOf(6);
    expect(items[0]).to.be.a("Promise");
    expect(items[1]).to.be.a("Promise");
    expect(items[2]).to.be.a("Promise");
    expect(items[3]).to.be.a("Promise");
    expect(items[4]).to.be.a("Promise");
    expect(items[5]).to.be.a("Promise");
    expect(await Promise.all(items)).to.deep.equal([
      { firstName: "Fred", lastName: "Flintstone" },
      { firstName: "Wilma", lastName: "Flintstone" },
      { firstName: "Pebbles", lastName: "Flintstone" },
      { firstName: "Barney", lastName: "Rubble" },
      { firstName: "Betty", lastName: "Rubble" },
      { firstName: "Bam Bam", lastName: "Rubble" },
    ]);
  });

  it("should read values from an async iterator concurrently", async () => {
    let startTime = Date.now();
    let callTimes = [];                                   // Keeps to rack of each time next() is called

    let slowIterator = {
      async next () {
        callTimes.push(Date.now() - startTime);           // Record the time that next() was called
        return await delay(100, { value: null });         // Each call to next() takes 100ms to resolve
      }
    };

    let iterator = iterate(slowIterator)[Symbol.asyncIterator]();

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

  it("should read values from an async generator sequentially", async () => {
    let startTime = Date.now();
    let callTimes = [];                                   // Keeps to rack of each time next() is called

    async function* slowGenerator () {
      while (true) {
        callTimes.push(Date.now() - startTime);           // Record the time that next() was called
        yield await delay(100);                           // Each call to next() takes 100ms to resolve
      }
    }

    let iterator = iterate(slowGenerator())[Symbol.asyncIterator]();

    // Read multiple values simultaneously
    let promise1 = iterator.next();
    let promise2 = iterator.next();
    let promise3 = iterator.next();

    await Promise.all([promise1, promise2, promise3]);

    // The time needed to resolve all three reads should be 300ms, not 100ms.
    expect(Date.now() - startTime).to.be.at.least(300).and.below(300 + TIME_BUFFER);

    // Each value should habe been read roughly 100ms after the previous one.
    // This is because generators don't allow simultaneous reads. Each call to next() is queued up
    // and only starts after the previous call completes.
    expect(callTimes[0]).to.be.at.most(0 + TIME_BUFFER);
    expect(callTimes[1]).to.be.at.most(100 + TIME_BUFFER);
    expect(callTimes[1]).to.be.at.most(200 + TIME_BUFFER);
  });

  it("should throw an error for an invalid iterator", async () => {
    let iterator = {
      next () {
        return null;
      }
    };

    try {
      await iterate(iterator).all();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Iterator result null is not an object");
    }
  });

});
