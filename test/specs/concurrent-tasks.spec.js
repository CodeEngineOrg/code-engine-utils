"use strict";

const { ConcurrentTasks } = require("../../");
const { assert, expect } = require("chai");
const { delay } = require("../utils");

// CI environments are slow, so use a larger buffer
const TIME_BUFFER = process.env.CI ? 100 : 30;

describe("ConcurrentTasks class", () => {

  async function assertTimeTaken (promise, time) {
    let startTime = Date.now();
    await promise;
    let endTime = Date.now();

    expect(endTime - startTime).to.be.at.least(time - TIME_BUFFER).and.at.most(time + TIME_BUFFER);
  }

  it("can be called with new", () => {
    let tasks = new ConcurrentTasks(5);
    expect(tasks).to.be.an.instanceOf(ConcurrentTasks);
  });

  it("cannot be called as a function", () => {
    try {
      // eslint-disable-next-line new-cap
      ConcurrentTasks(5);
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal("Class constructor ConcurrentTasks cannot be invoked without 'new'");
    }
  });

  it("should run zero tasks", async () => {
    let tasks = new ConcurrentTasks(5);

    await assertTimeTaken(tasks.waitForAvailability(), 0);
    await assertTimeTaken(tasks.waitForAll(), 0);
  });

  it("should run a single task", async () => {
    let tasks = new ConcurrentTasks(5);

    tasks.add(delay(300));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    await assertTimeTaken(tasks.waitForAll(), 300);
  });

  it("should run fewer tasks than the concurrency limit", async () => {
    let tasks = new ConcurrentTasks(5);

    tasks.add(delay(300));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    tasks.add(delay(400));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    tasks.add(delay(500));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    await assertTimeTaken(tasks.waitForAll(), 500);
  });

  it("should run more tasks than the concurrency limit", async () => {
    let tasks = new ConcurrentTasks(3);

    tasks.add(delay(300));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    tasks.add(delay(400));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    tasks.add(delay(500));
    await assertTimeTaken(tasks.waitForAvailability(), 300);

    tasks.add(delay(600));
    await assertTimeTaken(tasks.waitForAvailability(), 100);

    tasks.add(delay(700));
    await assertTimeTaken(tasks.waitForAvailability(), 100);

    await assertTimeTaken(tasks.waitForAll(), 600);
  });

  it("should throw an error if more tasks are added than the concurrency limit", async () => {
    let tasks = new ConcurrentTasks(3);

    tasks.add(delay(300));
    tasks.add(delay(400));
    tasks.add(delay(500));

    try {
      tasks.add(delay(600));
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(RangeError);
      expect(error.message).to.equal("Attempted to run too many concurrent tasks. Max is 3.");
    }
  });

});
