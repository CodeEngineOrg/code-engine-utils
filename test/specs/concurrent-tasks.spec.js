"use strict";

const { ConcurrentTasks } = require("../../");
const { assert, expect } = require("chai");
const delayed = require("../utils/delayed");

describe("ConcurrentTasks class", () => {
  function task (delay) {
    return delayed(undefined, delay);
  }

  async function assertTimeTaken (promise, time) {
    let startTime = Date.now();
    await promise;
    let endTime = Date.now();

    // CI environments are slow, so use a larger buffer
    const buffer = process.env.CI ? 75 : 10;

    expect(endTime - startTime).to.be.at.least(time - buffer).and.at.most(time + buffer);
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

    tasks.add(task(300));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    await assertTimeTaken(tasks.waitForAll(), 300);
  });

  it("should run fewer tasks than the concurrency limit", async () => {
    let tasks = new ConcurrentTasks(5);

    tasks.add(task(300));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    tasks.add(task(400));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    tasks.add(task(500));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    await assertTimeTaken(tasks.waitForAll(), 500);
  });

  it("should run more tasks than the concurrency limit", async () => {
    let tasks = new ConcurrentTasks(3);

    tasks.add(task(300));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    tasks.add(task(400));
    await assertTimeTaken(tasks.waitForAvailability(), 0);

    tasks.add(task(500));
    await assertTimeTaken(tasks.waitForAvailability(), 300);

    tasks.add(task(600));
    await assertTimeTaken(tasks.waitForAvailability(), 100);

    tasks.add(task(700));
    await assertTimeTaken(tasks.waitForAvailability(), 100);

    await assertTimeTaken(tasks.waitForAll(), 600);
  });

  it("should throw an error if more tasks are added than the concurrency limit", async () => {
    let tasks = new ConcurrentTasks(3);

    tasks.add(task(300));
    tasks.add(task(400));
    tasks.add(task(500));

    try {
      tasks.add(task(600));
      assert.fail("An error should have been thrown.");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(RangeError);
      expect(error.message).to.equal("Attempted to run too many concurrent tasks. Max is 3.");
    }
  });

});
