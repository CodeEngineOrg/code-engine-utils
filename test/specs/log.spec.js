"use strict";

const { log } = require("../../");
const { expect } = require("chai");
const sinon = require("sinon");

describe("log() function", () => {

  function createLogger () {
    return {
      log: sinon.spy(),
      debug: sinon.spy(),
      warn: sinon.spy(),
      error: sinon.spy(),
    };
  }

  it("can be called without a message or data", () => {
    let logger = createLogger();
    log(logger, "info");

    sinon.assert.calledOnce(logger.log);
    sinon.assert.calledWithExactly(logger.log, undefined, undefined);

    sinon.assert.notCalled(logger.debug);
    sinon.assert.notCalled(logger.warn);
    sinon.assert.notCalled(logger.error);
  });

  it("can be called with only a message", () => {
    let logger = createLogger();
    log(logger, "info", "hello, world");

    sinon.assert.calledOnce(logger.log);
    sinon.assert.calledWithExactly(logger.log, "hello, world", undefined);

    sinon.assert.notCalled(logger.debug);
    sinon.assert.notCalled(logger.warn);
    sinon.assert.notCalled(logger.error);
  });

  it('should call the logger.log() method when level is "info"', () => {
    let logger = createLogger();
    log(logger, "info", "hello, world", { foo: "bar" });

    sinon.assert.calledOnce(logger.log);
    expect(logger.log.firstCall.args[0]).to.equal("hello, world");
    expect(logger.log.firstCall.args[1]).to.deep.equal({ foo: "bar" });

    sinon.assert.notCalled(logger.debug);
    sinon.assert.notCalled(logger.warn);
    sinon.assert.notCalled(logger.error);
  });

  it('should call the logger.log() method when level is "log"', () => {
    let logger = createLogger();
    log(logger, "log", "hello, world", { foo: "bar" });

    sinon.assert.calledOnce(logger.log);
    expect(logger.log.firstCall.args[0]).to.equal("hello, world");
    expect(logger.log.firstCall.args[1]).to.deep.equal({ foo: "bar" });

    sinon.assert.notCalled(logger.debug);
    sinon.assert.notCalled(logger.warn);
    sinon.assert.notCalled(logger.error);
  });

  it('should call the logger.debug() method when level is "debug"', () => {
    let logger = createLogger();
    log(logger, "debug", "hello, world", { foo: "bar" });

    sinon.assert.calledOnce(logger.debug);
    expect(logger.debug.firstCall.args[0]).to.equal("hello, world");
    expect(logger.debug.firstCall.args[1]).to.deep.equal({ foo: "bar" });

    sinon.assert.notCalled(logger.log);
    sinon.assert.notCalled(logger.warn);
    sinon.assert.notCalled(logger.error);
  });

  it('should call the logger.warn() method when level is "warning"', () => {
    let logger = createLogger();
    log(logger, "warning", "hello, world", { foo: "bar" });

    sinon.assert.calledOnce(logger.warn);
    expect(logger.warn.firstCall.args[0]).to.equal("hello, world");
    expect(logger.warn.firstCall.args[1]).to.deep.equal({ foo: "bar" });

    sinon.assert.notCalled(logger.log);
    sinon.assert.notCalled(logger.debug);
    sinon.assert.notCalled(logger.error);
  });

  it('should call the logger.warn() method when level is "warn"', () => {
    let logger = createLogger();
    log(logger, "warn", "hello, world", { foo: "bar" });

    sinon.assert.calledOnce(logger.warn);
    expect(logger.warn.firstCall.args[0]).to.equal("hello, world");
    expect(logger.warn.firstCall.args[1]).to.deep.equal({ foo: "bar" });

    sinon.assert.notCalled(logger.log);
    sinon.assert.notCalled(logger.debug);
    sinon.assert.notCalled(logger.error);
  });

  it('should call the logger.error() method when level is "error"', () => {
    let logger = createLogger();
    log(logger, "error", "hello, world", { foo: "bar" });

    sinon.assert.calledOnce(logger.error);
    expect(logger.error.firstCall.args[0]).to.equal("hello, world");
    expect(logger.error.firstCall.args[1]).to.deep.equal({ foo: "bar" });

    sinon.assert.notCalled(logger.log);
    sinon.assert.notCalled(logger.debug);
    sinon.assert.notCalled(logger.warn);
  });

  it("should throw an error if called without any arguments", () => {
    function noArgs () {
      log();
    }

    expect(noArgs).to.throw(TypeError);
    expect(noArgs).to.throw("Invalid log level: undefined");
  });

  it("should throw an error if called without a log level", () => {
    let logger = createLogger();

    function noArgs () {
      log(logger);
    }

    expect(noArgs).to.throw(TypeError);
    expect(noArgs).to.throw("Invalid log level: undefined");
  });

  it("should throw an error if called with an invalid log level", () => {
    let logger = createLogger();

    function noArgs () {
      log(logger, "hello, world");
    }

    expect(noArgs).to.throw(TypeError);
    expect(noArgs).to.throw("Invalid log level: hello, world");
  });

  it("should throw an error if called without a logger", () => {
    function noLogger () {
      log(null, "info", "hello, world");
    }

    expect(noLogger).to.throw(Error);
    expect(noLogger).to.throw("Cannot read property 'log' of null");
  });

  it("should throw an error if called with an invalid logger", () => {
    function invalidLogger () {
      log({}, "info", "hello, world");
    }

    expect(invalidLogger).to.throw(Error);
    expect(invalidLogger).to.throw("logger.log is not a function");
  });

});
