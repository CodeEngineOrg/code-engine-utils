"use strict";

const { iterate } = require("../../");
const { assert, expect } = require("chai");
const { host } = require("@jsdevtools/host-environment");
const { delay, iterateAll } = require("../utils");

// CI environments are slow, so use a larger time buffer
const TIME_BUFFER = host.ci ? 150 : 50;

describe("iterate() function", () => {

  it("should return an empty iterator if called with no args", async () => {
    let items = await iterateAll(iterate());
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should return an empty iterator if called with undefined", async () => {
    let items = await iterateAll(iterate(undefined));
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should return an empty iterator if called with a void Promise", async () => {
    let items = await iterateAll(iterate(Promise.resolve()));
    expect(items).to.be.an("array").with.lengthOf(0);
  });

  it("should return the same instance if called multiple times", async () => {
    let iterable1 = await iterate([]);
    let iterable2 = await iterate(iterable1);
    expect(iterable1).to.equal(iterable2);
  });

  it("should return the same instance if it's already an async iterable", async () => {
    async function* generator () {
      yield 1;
    }

    let iterable1 = generator();
    let iterable2 = await iterate(iterable1);

    expect(iterable1).to.equal(iterable2);
  });

  it("should iterate a single falsy primitive", async () => {
    let items = await iterateAll(iterate(null));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([null]);

    items = await iterateAll(iterate(Promise.resolve(null)));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([null]);

    items = await iterateAll(iterate(false));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([false]);

    items = await iterateAll(iterate(Promise.resolve(false)));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([false]);

    items = await iterateAll(iterate(0));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([0]);

    items = await iterateAll(iterate(Promise.resolve(0)));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([0]);

    items = await iterateAll(iterate(""));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([""]);

    items = await iterateAll(iterate(Promise.resolve("")));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([""]);
  });

  it("should iterate a single truthy primitive", async () => {
    let items = await iterateAll(iterate("a"));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal(["a"]);

    items = await iterateAll(iterate(Promise.resolve("b")));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal(["b"]);

    items = await iterateAll(iterate(true));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([true]);

    items = await iterateAll(iterate(Promise.resolve(true)));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([true]);

    items = await iterateAll(iterate(42));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([42]);

    items = await iterateAll(iterate(Promise.resolve(-42)));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([-42]);
  });

  it("should iterate a single object", async () => {
    let items = await iterateAll(iterate({}));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([{}]);

    items = await iterateAll(iterate(Promise.resolve({ foo: "bar" })));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([{ foo: "bar" }]);

    items = await iterateAll(iterate(new Date("2005-05-05T05:05:05.005Z")));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([new Date("2005-05-05T05:05:05.005Z")]);

    items = await iterateAll(iterate(Promise.resolve(/^regex$/)));
    expect(items).to.be.an("array").with.lengthOf(1);
    expect(items).to.deep.equal([/^regex$/]);
  });

  it("should iterate a string", async () => {
    let items = await iterateAll(iterate("hello"));
    expect(items).to.be.an("array").with.lengthOf(5);
    expect(items).to.deep.equal(["h", "e", "l", "l", "o"]);

    items = await iterateAll(iterate(Promise.resolve("world")));
    expect(items).to.be.an("array").with.lengthOf(5);
    expect(items).to.deep.equal(["w", "o", "r", "l", "d"]);
  });

  it("should iterate an array", async () => {
    let items = await iterateAll(iterate(["hello", "world"]));
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items).to.deep.equal(["hello", "world"]);

    items = await iterateAll(iterate(Promise.resolve([1, 2, 3])));
    expect(items).to.be.an("array").with.lengthOf(3);
    expect(items).to.deep.equal([1, 2, 3]);

    items = await iterateAll(iterate(Promise.resolve([{ name: "Fred" }, { name: "Barney" }])));
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items).to.deep.equal([{ name: "Fred" }, { name: "Barney" }]);
  });

  it("should iterate an array of Promises", async () => {
    let items = await iterateAll(iterate([Promise.resolve("hello"), Promise.resolve("world")]));
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items[0]).to.be.a("Promise");
    expect(items[1]).to.be.a("Promise");
    expect(await Promise.all(items)).to.deep.equal(["hello", "world"]);

    items = await iterateAll(iterate(Promise.resolve([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])));
    expect(items).to.be.an("array").with.lengthOf(3);
    expect(items[0]).to.be.a("Promise");
    expect(items[1]).to.be.a("Promise");
    expect(items[2]).to.be.a("Promise");
    expect(await Promise.all(items)).to.deep.equal([1, 2, 3]);

    items = await iterateAll(iterate([Promise.resolve({ name: "Fred" }), Promise.resolve({ name: "Barney" })]));
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

    let items = await iterateAll(iterate(helloWorld()));
    expect(items).to.be.an("array").with.lengthOf(2);
    expect(items).to.deep.equal(["hello", "world"]);
  });

  it("should iterate a Promise generator", async () => {
    function* counter () {
      yield Promise.resolve(1);
      yield Promise.resolve(2);
      yield Promise.resolve(3);
    }

    let items = await iterateAll(iterate(counter()));
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

    let items = await iterateAll(iterate(getPeople()));
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

    let items = await iterateAll(iterate(getObjects()));
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

    let items = await iterateAll(iterate(iterator));
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

    let items = await iterateAll(iterate(iterator));
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
    let callTimes = [];                                   // Keeps track of each time next() is called

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
    let callTimes = [];                                   // Keeps track of each time next() is called

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
      await iterateAll(iterate(iterator));
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Iterator result null is not an object");
    }
  });

});
