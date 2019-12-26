"use strict";

const { createLogEmitter } = require("../../lib");
const { expect } = require("chai");
const sinon = require("sinon");

describe.only("createLogEmitter() function", () => {

  function createEventEmitter () {
    return {
      emit: sinon.spy(),
    };
  }

  it("can be called without any arguments", () => {
    let emitter = createEventEmitter();
    let log = createLogEmitter(emitter);
    log();

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
      level: "info",
      message: "",
    }));
  });

  it("can be called with only a message", () => {
    let emitter = createEventEmitter();
    let log = createLogEmitter(emitter);
    log("hello, world");

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
      level: "info",
      message: "hello, world",
    }));
  });

  it("can be called with a message and data", () => {
    let emitter = createEventEmitter();
    let log = createLogEmitter(emitter);
    log("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
      level: "info",
      message: "hello, world",
      foo: "bar",
      answer: 42,
      now: /^regex$/
    }));
  });

  it("can be called with an error", () => {
    let emitter = createEventEmitter();
    let log = createLogEmitter(emitter);
    log(new RangeError("Boom!"));

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
      level: "error",
      message: "Boom!",
      error: {
        name: "RangeError",
        message: "Boom!",
      }
    }));
  });

  it("can be called with an error and data", () => {
    let emitter = createEventEmitter();
    let log = createLogEmitter(emitter);
    log(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
      level: "error",
      message: "Boom!",
      error: {
        name: "RangeError",
        message: "Boom!",
      },
      foo: "bar",
      answer: 42,
      now: /^regex$/
    }));
  });

  it("should throw an error if called without an event emitter", () => {
    function noArgs () {
      createLogEmitter();
    }

    expect(noArgs).to.throw(TypeError);
    expect(noArgs).to.throw("Invalid EventEmitter: undefined. A value is required.");
  });

  it("should throw an error if called with an invalid event emitter", () => {
    function invalidEmitter () {
      createLogEmitter({ emit: true });
    }

    expect(invalidEmitter).to.throw(TypeError);
    expect(invalidEmitter).to.throw("Invalid EventEmitter: true. Expected a function.");
  });

  describe("info", () => {
    it("can be called without any arguments", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.info();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "info",
        message: "",
      }));
    });

    it("can be called with only a message", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.info("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "info",
        message: "hello, world",
      }));
    });

    it("can be called with a message and data", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.info("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "info",
        message: "hello, world",
        foo: "bar",
        answer: 42,
        now: /^regex$/
      }));
    });

    it("can be called with a non-string message", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.info({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "info",
        message: "[object Object]",
      }));
    });

    it("can be called with a non-string message and data", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.info(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "info",
        message: "RangeError: Boom!",
        foo: "bar",
        answer: 42,
        now: /^regex$/
      }));
    });
  });

  describe("debug", () => {
    it("does nothing if not in debug mode", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.debug("this message won't get logged");

      sinon.assert.notCalled(emitter.emit);
    });

    it("can be called without any arguments", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter, true);
      log.debug();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "debug",
        message: "",
      }));
    });

    it("can be called with only a message", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter, true);
      log.debug("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "debug",
        message: "hello, world",
      }));
    });

    it("can be called with a message and data", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter, true);
      log.debug("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "debug",
        message: "hello, world",
        foo: "bar",
        answer: 42,
        now: /^regex$/
      }));
    });

    it("can be called with a non-string message", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter, true);
      log.debug({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "debug",
        message: "[object Object]",
      }));
    });

    it("can be called with a non-string message and data", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter, true);
      log.debug(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "debug",
        message: "RangeError: Boom!",
        foo: "bar",
        answer: 42,
        now: /^regex$/
      }));
    });
  });

  describe("warn", () => {
    it("can be called without any arguments", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.warn();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "warning",
        message: "",
      }));
    });

    it("can be called with only a message", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.warn("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "warning",
        message: "hello, world",
      }));
    });

    it("can be called with a message and data", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.warn("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "warning",
        message: "hello, world",
        foo: "bar",
        answer: 42,
        now: /^regex$/
      }));
    });

    it("can be called with a non-error object", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.warn({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "warning",
        message: "[object Object]",
        error: {
          foo: "bar"
        }
      }));
    });

    it("can be called with an error", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.warn(new RangeError("Boom!"));

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "warning",
        message: "Boom!",
        error: {
          name: "RangeError",
          message: "Boom!",
        }
      }));
    });

    it("can be called with an error and data", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.warn(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "warning",
        message: "Boom!",
        error: {
          name: "RangeError",
          message: "Boom!",
        },
        foo: "bar",
        answer: 42,
        now: /^regex$/
      }));
    });
  });

  describe("error", () => {
    it("can be called without any arguments", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.error();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "error",
        message: "",
      }));
    });

    it("can be called with only a message", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.error("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "error",
        message: "hello, world",
      }));
    });

    it("can be called with a message and data", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.error("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "error",
        message: "hello, world",
        foo: "bar",
        answer: 42,
        now: /^regex$/
      }));
    });

    it("can be called with a non-error object", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.error({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "error",
        message: "[object Object]",
        error: {
          foo: "bar"
        }
      }));
    });

    it("can be called with an error", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.error(new RangeError("Boom!"));

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "error",
        message: "Boom!",
        error: {
          name: "RangeError",
          message: "Boom!",
        }
      }));
    });

    it("can be called with an error and data", () => {
      let emitter = createEventEmitter();
      let log = createLogEmitter(emitter);
      log.error(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit, "log", sinon.match({
        level: "error",
        message: "Boom!",
        error: {
          name: "RangeError",
          message: "Boom!",
        },
        foo: "bar",
        answer: 42,
        now: /^regex$/
      }));
    });
  });
});
