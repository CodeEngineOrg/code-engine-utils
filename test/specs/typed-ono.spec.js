"use strict";

const { typedOno } = require("../../lib");
const { assert, expect } = require("chai");

describe("typedOno() function", () => {

  it("should create a base Error", () => {
    let originalError = new Error("Oops");
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.equal("Oops");
    expect(error).not.to.equal(originalError);
  });

  it("should create an EvalError", () => {
    let originalError = new EvalError("Oops");
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(EvalError);
    expect(error.message).to.equal("Oops");
    expect(error).not.to.equal(originalError);
  });

  it("should create a RangeError", () => {
    let originalError = new RangeError("Oops");
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(RangeError);
    expect(error.message).to.equal("Oops");
    expect(error).not.to.equal(originalError);
  });

  it("should create a ReferenceError", () => {
    let originalError = new ReferenceError("Oops");
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(ReferenceError);
    expect(error.message).to.equal("Oops");
    expect(error).not.to.equal(originalError);
  });

  it("should create a SyntaxError", () => {
    let originalError = new SyntaxError("Oops");
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(SyntaxError);
    expect(error.message).to.equal("Oops");
    expect(error).not.to.equal(originalError);
  });

  it("should create a TypeError", () => {
    let originalError = new TypeError("Oops");
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(TypeError);
    expect(error.message).to.equal("Oops");
    expect(error).not.to.equal(originalError);
  });

  it("should create a URIError", () => {
    let originalError = new URIError("Oops");
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(URIError);
    expect(error.message).to.equal("Oops");
    expect(error).not.to.equal(originalError);
  });

  it("should create a base Error if the error name is unknown", () => {
    let originalError = new RangeError("Oops");
    originalError.name = "MyCustomError";
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(Error);
    expect(error).not.to.be.an.instanceOf(RangeError);
    expect(error.message).to.equal("Oops");
  });

  it("should create a base Error for custom error classes", () => {
    class MyCustomError extends RangeError {
      constructor (message) {
        super(message);
        this.name = "MyCustomError";
      }
    }

    let originalError = new MyCustomError("Oops");
    let error = typedOno(originalError);

    expect(error).to.be.an.instanceOf(Error);
    expect(error).not.to.be.an.instanceOf(RangeError);
    expect(error).not.to.be.an.instanceOf(MyCustomError);
    expect(error.message).to.equal("Oops");
  });

  it("should create an error with custom properties", () => {
    let originalError = new RangeError("Oops");
    let error = typedOno(originalError, { foo: "bar", counter: 123 });

    expect(error).to.be.an.instanceOf(RangeError);
    expect(error.message).to.equal("Oops");
    expect(error).not.to.equal(originalError);
    expect(error.foo).to.equal("bar");
    expect(error.counter).to.equal(123);
  });

  it("should create an error with a message", () => {
    let originalError = new RangeError("Oops");
    let error = typedOno(originalError, "Something went wrong.");

    expect(error).to.be.an.instanceOf(RangeError);
    expect(error.message).to.equal("Something went wrong. \nOops");
    expect(error).not.to.equal(originalError);
  });

  it("should create an error with custom properties and a message", () => {
    let originalError = new RangeError("Oops");
    let error = typedOno(originalError, { foo: "bar", counter: 123 }, "Something went wrong.");

    expect(error).to.be.an.instanceOf(RangeError);
    expect(error.message).to.equal("Something went wrong. \nOops");
    expect(error).not.to.equal(originalError);
    expect(error.foo).to.equal("bar");
    expect(error.counter).to.equal(123);
  });

  it("should throw an error if called without any arguments", () => {
    try {
      typedOno();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Cannot read property 'name' of undefined");
    }
  });

});
