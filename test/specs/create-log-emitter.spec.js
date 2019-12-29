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

  it("can be called without any arguments", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context);
    log();

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit,
      "log",
      sinon.match({
        level: "info",
        message: "",
      }),
      context
    );
  });

  it("can be called with only a message", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context);
    log("hello, world");

    sinon.assert.calledOnce(emitter.emit);
    sinon.assert.calledWithExactly(emitter.emit,
      "log",
      sinon.match({
        level: "info",
        message: "hello, world",
      }),
      context
    );
  });

  it("can be called with a message and data", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context);
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
      }),
      context
    );
  });

  it("can be called with an error", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context);
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
      }),
      context
    );
  });

  it("can be called with an error and data", () => {
    let { emitter, context } = createMocks();
    let log = createLogEmitter(emitter, context);
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
      }),
      context
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

  it("should throw an error if called without a context object", () => {
    function noContext () {
      let { emitter } = createMocks();
      createLogEmitter(emitter);
    }

    expect(noContext).to.throw(TypeError);
    expect(noContext).to.throw("Invalid CodeEngine context: undefined. A value is required.");
  });

  it("should throw an error if called with an invalid context object", () => {
    function invalidContext () {
      let { emitter } = createMocks();
      createLogEmitter(emitter, true);
    }

    expect(invalidContext).to.throw(TypeError);
    expect(invalidContext).to.throw("Invalid CodeEngine context: true. Expected an object.");
  });

  describe("info", () => {
    it("can be called without any arguments", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
      log.info();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "info",
          message: "",
        }),
        context
      );
    });

    it("can be called with only a message", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
      log.info("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "info",
          message: "hello, world",
        }),
        context
      );
    });

    it("can be called with a message and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });

    it("can be called with a non-string message", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
      log.info({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "info",
          message: "[object Object]",
        }),
        context
      );
    });

    it("can be called with a non-string message and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });
  });

  describe("debug", () => {
    it("does nothing if not in debug mode", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
      log.debug("this message won't get logged");

      sinon.assert.notCalled(emitter.emit);
    });

    it("can be called without any arguments", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context);
      log.debug();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "debug",
          message: "",
        }),
        context
      );
    });

    it("can be called with only a message", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context);
      log.debug("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "debug",
          message: "hello, world",
        }),
        context
      );
    });

    it("can be called with a message and data", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });

    it("can be called with a non-string message", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context);
      log.debug({ foo: "bar" });

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "debug",
          message: "[object Object]",
        }),
        context
      );
    });

    it("can be called with a non-string message and data", () => {
      let { emitter, context } = createMocks();
      context.debug = true;
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });
  });

  describe("warn", () => {
    it("can be called without any arguments", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
      log.warn();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "warning",
          message: "",
        }),
        context
      );
    });

    it("can be called with only a message", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
      log.warn("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "warning",
          message: "hello, world",
        }),
        context
      );
    });

    it("can be called with a message and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });

    it("can be called with a non-error object", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });

    it("can be called with an error", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });

    it("can be called with an error and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });
  });

  describe("error", () => {
    it("can be called without any arguments", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
      log.error();

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "error",
          message: "",
        }),
        context
      );
    });

    it("can be called with only a message", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
      log.error("hello, world");

      sinon.assert.calledOnce(emitter.emit);
      sinon.assert.calledWithExactly(emitter.emit,
        "log",
        sinon.match({
          level: "error",
          message: "hello, world",
        }),
        context
      );
    });

    it("can be called with a message and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });

    it("can be called with a non-error object", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });

    it("can be called with an error", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });

    it("can be called with an error and data", () => {
      let { emitter, context } = createMocks();
      let log = createLogEmitter(emitter, context);
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
        }),
        context
      );
    });
  });
});
