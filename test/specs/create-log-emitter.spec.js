"use strict";

const { createLogEmitter } = require("../../lib");
const { expect } = require("chai");
const sinon = require("sinon");

describe("createLogEmitter() function", () => {

  function createMocks () {
    let emitter = {
      emit: sinon.spy(),
    };

    let context = {
      cwd: process.cwd(),
      concurrency: 4,
      dev: false,
      debug: false,
    };

    return { emitter, context };
  }

  it("doesn't override the Context.log property if already set", () => {
    function myOwnLogger () {}

    let { emitter, context } = createMocks();
    context.log = myOwnLogger;
    let log = createLogEmitter(emitter, context.debug);

    expect(context.log).not.to.equal(log);
    expect(context.log).to.equal(myOwnLogger);
  });

  it("can be called without any arguments", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context.debug);
    log();

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit,
      "log",
      sinon.match({
        level: "info",
        message: "",
      })
    );
  });

  it("can be called with only a message", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context.debug);
    log("hello, world");

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit,
      "log",
      sinon.match({
        level: "info",
        message: "hello, world",
      })
    );
  });

  it("can be called with a message and data", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context.debug);
    log("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit,
      "log",
      sinon.match({
        level: "info",
        message: "hello, world",
        foo: "bar",
        answer: 42,
        now: /^regex$/
      })
    );
  });

  it("can be called with an error", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context.debug);
    log(new RangeError("Boom!"));

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit,
      "log",
      sinon.match({
        level: "error",
        message: "Boom!",
        error: {
          name: "RangeError",
          message: "Boom!",
        }
      })
    );
  });

  it("can be called with an error and data", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context.debug);
    log(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit,
      "log",
      sinon.match({
        level: "error",
        message: "Boom!",
        error: {
          name: "RangeError",
          message: "Boom!",
        },
        foo: "bar",
        answer: 42,
        now: /^regex$/
      })
    );
  });

  it("should throw an error if called without any arguments", () => {
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
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.info();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "info",
          message: "",
        })
      );
    });

    it("can be called with only a message", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.info("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "info",
          message: "hello, world",
        })
      );
    });

    it("can be called with a message and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.info("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "info",
          message: "hello, world",
          foo: "bar",
          answer: 42,
          now: /^regex$/
        })
      );
    });

    it("can be called with a non-string message", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.info({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "info",
          message: "[object Object]",
        })
      );
    });

    it("can be called with a non-string message and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.info(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "info",
          message: "RangeError: Boom!",
          foo: "bar",
          answer: 42,
          now: /^regex$/
        })
      );
    });
  });

  describe("debug", () => {
    it("does nothing if not in debug mode", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.debug("this message won't get logged");

      sinon.assert.notCalled(emitter.emit);
    });

    it("can be called without any arguments", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context.debug);
      log.debug();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "debug",
          message: "",
        })
      );
    });

    it("can be called with only a message", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context.debug);
      log.debug("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "debug",
          message: "hello, world",
        })
      );
    });

    it("can be called with a message and data", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context.debug);
      log.debug("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "debug",
          message: "hello, world",
          foo: "bar",
          answer: 42,
          now: /^regex$/
        })
      );
    });

    it("can be called with a non-string message", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context.debug);
      log.debug({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "debug",
          message: "[object Object]",
        })
      );
    });

    it("can be called with a non-string message and data", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context.debug);
      log.debug(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "debug",
          message: "RangeError: Boom!",
          foo: "bar",
          answer: 42,
          now: /^regex$/
        })
      );
    });
  });

  describe("warn", () => {
    it("can be called without any arguments", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.warn();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "warning",
          message: "",
        })
      );
    });

    it("can be called with only a message", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.warn("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "warning",
          message: "hello, world",
        })
      );
    });

    it("can be called with a message and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.warn("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "warning",
          message: "hello, world",
          foo: "bar",
          answer: 42,
          now: /^regex$/
        })
      );
    });

    it("can be called with a non-error object", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.warn({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "warning",
          message: "[object Object]",
          error: {
            foo: "bar"
          }
        })
      );
    });

    it("can be called with an error", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.warn(new RangeError("Boom!"));

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "warning",
          message: "Boom!",
          error: {
            name: "RangeError",
            message: "Boom!",
          }
        })
      );
    });

    it("can be called with an error and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.warn(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "warning",
          message: "Boom!",
          error: {
            name: "RangeError",
            message: "Boom!",
          },
          foo: "bar",
          answer: 42,
          now: /^regex$/
        })
      );
    });
  });

  describe("error", () => {
    it("can be called without any arguments", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.error();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "error",
          message: "",
        })
      );
    });

    it("can be called with only a message", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.error("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "error",
          message: "hello, world",
        })
      );
    });

    it("can be called with a message and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.error("hello, world", { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "error",
          message: "hello, world",
          foo: "bar",
          answer: 42,
          now: /^regex$/
        })
      );
    });

    it("can be called with a non-error object", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.error({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "error",
          message: "[object Object]",
          error: {
            foo: "bar"
          }
        })
      );
    });

    it("can be called with an error", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.error(new RangeError("Boom!"));

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "error",
          message: "Boom!",
          error: {
            name: "RangeError",
            message: "Boom!",
          }
        })
      );
    });

    it("can be called with an error and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context.debug);
      log.error(new RangeError("Boom!"), { foo: "bar", answer: 42, now: /^regex$/ });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "error",
          message: "Boom!",
          error: {
            name: "RangeError",
            message: "Boom!",
          },
          foo: "bar",
          answer: 42,
          now: /^regex$/
        })
      );
    });
  });
});
