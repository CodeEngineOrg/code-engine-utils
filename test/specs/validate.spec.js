/* globals BigInt */
/* eslint-disable no-new-object, no-new-wrappers */
"use strict";

const { validate } = require("../../");
const { expect } = require("chai");

describe("Validation functions", () => {

  describe("validate.hasValue()", () => {
    it("should validate falsy values", () => {
      expect(validate.hasValue(null)).to.equal(null);
      expect(validate.hasValue(NaN)).to.satisfy(Number.isNaN);
      expect(validate.hasValue(false)).to.equal(false);
      expect(validate.hasValue(0)).to.equal(0);
      expect(validate.hasValue("")).to.equal("");
    });

    it("should validate truthy values", () => {
      expect(validate.hasValue(true)).to.equal(true);
      expect(validate.hasValue(123)).to.equal(123);
      expect(validate.hasValue(" ")).to.equal(" ");
      expect(validate.hasValue("Hello, world!")).to.equal("Hello, world!");
      expect(validate.hasValue({})).to.be.an("object");
      expect(validate.hasValue(/regex/)).to.be.an.instanceOf(RegExp);
      expect(validate.hasValue(new Date())).to.be.an.instanceOf(Date);
    });

    it("should validate default values", () => {
      expect(validate.hasValue(undefined, "thing", null)).to.equal(null);
      expect(validate.hasValue(undefined, "thing", NaN)).to.satisfy(Number.isNaN);
      expect(validate.hasValue(undefined, "thing", false)).to.equal(false);
      expect(validate.hasValue(undefined, "thing", true)).to.equal(true);
      expect(validate.hasValue(undefined, "thing", 0)).to.equal(0);
      expect(validate.hasValue(undefined, "thing", -12345)).to.equal(-12345);
      expect(validate.hasValue(undefined, "thing", "")).to.equal("");
      expect(validate.hasValue(undefined, "thing", " ")).to.equal(" ");
      expect(validate.hasValue(undefined, "thing", "Hello, world!")).to.equal("Hello, world!");
      expect(validate.hasValue(undefined, "thing", {})).to.be.an("object");
      expect(validate.hasValue(undefined, "thing", /regex/)).to.be.an.instanceOf(RegExp);
      expect(validate.hasValue(undefined, "thing", new Date())).to.be.an.instanceOf(Date);
    });

    it("should throw an error for undefined values", () => {
      function invalid (value) {
        return () => {
          validate.hasValue(value);
        };
      }

      expect(invalid(undefined)).to.throw(TypeError, "Invalid value: undefined. A value is required.");
    });

    it("should throw an error for invalid defaults", () => {
      function invalidDefault (defaultValue) {
        return () => {
          validate.hasValue(undefined, "thing", defaultValue);
        };
      }

      expect(invalidDefault(undefined)).to.throw(TypeError, "Invalid thing: undefined. A value is required.");
    });
  });

  describe("validate.string()", () => {
    it("should validate empty strings", () => {
      expect(validate.string("")).to.equal("");
    });

    it("should validate whitespace strings", () => {
      expect(validate.string(" ")).to.equal(" ");
      expect(validate.string("\t")).to.equal("\t");
      expect(validate.string("\n")).to.equal("\n");
      expect(validate.string("\t \n")).to.equal("\t \n");
    });

    it("should validate text strings", () => {
      expect(validate.string("Hello, world")).to.equal("Hello, world");
    });

    it("should validate numeric strings", () => {
      expect(validate.string("0")).to.equal("0");
      expect(validate.string("123")).to.equal("123");
      expect(validate.string("Infinity")).to.equal("Infinity");
    });

    it("should validate default values", () => {
      expect(validate.string(undefined, "name", "")).to.equal("");
      expect(validate.string(undefined, "name", "\t \n")).to.equal("\t \n");
      expect(validate.string(undefined, "name", "Hello, world")).to.equal("Hello, world");
      expect(validate.string(undefined, "name", "123")).to.equal("123");
    });

    it("should throw an error for invalid values", () => {
      function invalid (value) {
        return () => {
          validate.string(value);
        };
      }

      expect(invalid(NaN)).to.throw(TypeError, "Invalid value: NaN. Expected a string.");
      expect(invalid(null)).to.throw(TypeError, "Invalid value: null. Expected a string.");
      expect(invalid(0)).to.throw(TypeError, "Invalid value: 0. Expected a string.");
      expect(invalid(Number.MAX_VALUE)).to.throw(TypeError, "Invalid value: 1.7976931348623157e+308. Expected a string.");
      expect(invalid(String)).to.throw(TypeError, "Invalid value: function. Expected a string.");
      expect(invalid(new Date())).to.throw(TypeError, "Invalid value: Date. Expected a string.");
      expect(invalid(/1234/)).to.throw(TypeError, "Invalid value: /1234/. Expected a string.");
      expect(invalid({ foo: "bar" })).to.throw(TypeError, "Invalid value: {foo}. Expected a string.");
      expect(invalid([1, 2, 3])).to.throw(TypeError, "Invalid value: [1,2,3]. Expected a string.");
    });

    it("should throw an error for invalid defaults", () => {
      function invalidDefault (defaultValue) {
        return () => {
          validate.string(undefined, "name", defaultValue);
        };
      }

      expect(invalidDefault(NaN)).to.throw(TypeError, "Invalid name: NaN. Expected a string.");
      expect(invalidDefault(null)).to.throw(TypeError, "Invalid name: null. Expected a string.");
      expect(invalidDefault(0)).to.throw(TypeError, "Invalid name: 0. Expected a string.");
      expect(invalidDefault(Number.MAX_VALUE)).to.throw(TypeError, "Invalid name: 1.7976931348623157e+308. Expected a string.");
      expect(invalidDefault(String)).to.throw(TypeError, "Invalid name: function. Expected a string.");
      expect(invalidDefault(new Date())).to.throw(TypeError, "Invalid name: Date. Expected a string.");
      expect(invalidDefault(/1234/)).to.throw(TypeError, "Invalid name: /1234/. Expected a string.");
      expect(invalidDefault({ foo: "bar" })).to.throw(TypeError, "Invalid name: {foo}. Expected a string.");
      expect(invalidDefault([1, 2, 3])).to.throw(TypeError, "Invalid name: [1,2,3]. Expected a string.");
    });
  });

  describe("validate.minLength()", () => {
    it("should validate non-empty strings by default", () => {
      expect(validate.minLength(" ")).to.equal(" ");
      expect(validate.minLength("\n")).to.equal("\n");
      expect(validate.minLength("abc")).to.equal("abc");
      expect(validate.minLength("Hello, world")).to.equal("Hello, world");
    });

    it("should validate strings that meet the minimum", () => {
      expect(validate.minLength(" ", 1)).to.equal(" ");
      expect(validate.minLength("hello", 3)).to.equal("hello");
      expect(validate.minLength("hello", 5)).to.equal("hello");
    });

    it("should validate default values", () => {
      expect(validate.minLength(undefined, "name", 1, " ")).to.equal(" ");
      expect(validate.minLength(undefined, "name", 3, "hello")).to.equal("hello");
      expect(validate.minLength(undefined, "name", 5, "hello")).to.equal("hello");
    });

    it("should throw an error for empty strings by default", () => {
      function empty (value) {
        return () => {
          validate.minLength(value);
        };
      }

      expect(empty("")).to.throw(TypeError, 'Invalid value: "". It cannot be empty.');
    });

    it("should throw an error for strings that don't meet the minimum", () => {
      function tooShort (value, minLength) {
        return () => {
          validate.minLength(value, minLength);
        };
      }

      expect(tooShort(" ", 2)).to.throw(TypeError, 'Invalid value: " ". It should be at least 2 characters.');
      expect(tooShort("abc", 5)).to.throw(TypeError, 'Invalid value: "abc". It should be at least 5 characters.');
      expect(tooShort("Hello, world!", 100)).to.throw(TypeError, 'Invalid value: "Hello, world!". It should be at least 100 characters.');
    });

    it("should throw an error for defaults that don't meet the minimum", () => {
      function invalidDefault (defaultValue, minLength) {
        return () => {
          validate.minLength(undefined, minLength, "name", defaultValue);
        };
      }

      expect(invalidDefault(" ", 2)).to.throw(TypeError, 'Invalid name: " ". It should be at least 2 characters.');
      expect(invalidDefault("abc", 5)).to.throw(TypeError, 'Invalid name: "abc". It should be at least 5 characters.');
      expect(invalidDefault("Hello, world!", 100)).to.throw(TypeError, 'Invalid name: "Hello, world!". It should be at least 100 characters.');
    });
  });

  describe("validate.number()", () => {
    it("should validate numbers", () => {
      expect(validate.number(1.0)).to.equal(1);
      expect(validate.number(42)).to.equal(42);
      expect(validate.number(-100)).to.equal(-100);
      expect(validate.number(-1.234)).to.equal(-1.234);
      expect(validate.number(Number.MIN_VALUE)).to.equal(Number.MIN_VALUE);
      expect(validate.number(Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.number(Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
      expect(validate.number(Number.EPSILON)).to.equal(Number.EPSILON);
    });

    it("should validate default values", () => {
      expect(validate.number(undefined, "latitude", 1.0)).to.equal(1);
      expect(validate.number(undefined, "latitude", 42)).to.equal(42);
      expect(validate.number(undefined, "latitude", -100)).to.equal(-100);
      expect(validate.number(undefined, "latitude", -1.234)).to.equal(-1.234);
      expect(validate.number(undefined, "latitude", Number.MIN_VALUE)).to.equal(Number.MIN_VALUE);
      expect(validate.number(undefined, "latitude", Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.number(undefined, "latitude", Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
      expect(validate.number(undefined, "latitude", Number.EPSILON)).to.equal(Number.EPSILON);
    });

    it("should throw an error for invalid values", () => {
      function invalid (value) {
        return () => {
          validate.number(value);
        };
      }

      expect(invalid(NaN)).to.throw(TypeError, "Invalid value: NaN. Expected a number.");
      expect(invalid(null)).to.throw(TypeError, "Invalid value: null. Expected a number.");
      expect(invalid("")).to.throw(TypeError, "Invalid value: \"\". Expected a number.");
      expect(invalid("Hello, World")).to.throw(TypeError, "Invalid value: \"Hello, World\". Expected a number.");
      expect(invalid(new Date())).to.throw(TypeError, "Invalid value: Date. Expected a number.");
      expect(invalid(/1234/)).to.throw(TypeError, "Invalid value: /1234/. Expected a number.");
      expect(invalid({ foo: "bar" })).to.throw(TypeError, "Invalid value: {foo}. Expected a number.");
      expect(invalid([1, 2, 3])).to.throw(TypeError, "Invalid value: [1,2,3]. Expected a number.");
    });

    it("should throw an error for invalid defaults", () => {
      function negative (defaultValue) {
        return () => {
          validate.number(undefined, "latitude", defaultValue);
        };
      }

      expect(negative(NaN)).to.throw(TypeError, "Invalid latitude: NaN. Expected a number.");
      expect(negative("")).to.throw(TypeError, "Invalid latitude: \"\". Expected a number.");
      expect(negative(new Date())).to.throw(TypeError, "Invalid latitude: Date. Expected a number.");
    });
  });

  describe("validate.integer()", () => {
    it("should validate integers", () => {
      expect(validate.integer(1.0)).to.equal(1);
      expect(validate.integer(42)).to.equal(42);
      expect(validate.integer(-100)).to.equal(-100);
      expect(validate.integer(-1)).to.equal(-1);
      expect(validate.integer(Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.integer(Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
    });

    it("should throw an error for fractional numbers", () => {
      function fraction (value) {
        return () => {
          validate.integer(value);
        };
      }

      expect(fraction(1.1)).to.throw(TypeError, "Invalid value: 1.1. Expected an integer.");
      expect(fraction(-1.234)).to.throw(TypeError, "Invalid value: -1.234. Expected an integer.");
      expect(fraction(Math.PI)).to.throw(TypeError, "Invalid value: 3.141592653589793. Expected an integer.");
      expect(fraction(Number.EPSILON)).to.throw(TypeError, "Invalid value: 2.220446049250313e-16. Expected an integer.");
    });

    it("should throw an error for non-finite numbers", () => {
      function infinite (value) {
        return () => {
          validate.integer(value);
        };
      }

      expect(infinite(Infinity)).to.throw(TypeError, "Invalid value: Infinity. Expected an integer.");
      expect(infinite(-Infinity)).to.throw(TypeError, "Invalid value: -Infinity. Expected an integer.");
    });

    it("should throw an error for invalid defaults", () => {
      function negative (defaultValue) {
        return () => {
          validate.integer(undefined, "offset", defaultValue);
        };
      }

      expect(negative(Infinity)).to.throw(TypeError, "Invalid offset: Infinity. Expected an integer.");
      expect(negative(Number.EPSILON)).to.throw(TypeError, "Invalid offset: 2.220446049250313e-16. Expected an integer.");
    });
  });

  describe("validate.positiveInteger()", () => {
    it("should validate positive integers", () => {
      expect(validate.positiveInteger(1.0)).to.equal(1);
      expect(validate.positiveInteger(42)).to.equal(42);
      expect(validate.positiveInteger(100)).to.equal(100);
      expect(validate.positiveInteger(Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.positiveInteger(Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
    });

    it("should throw an error for negative numbers", () => {
      function negative (value) {
        return () => {
          validate.positiveInteger(value);
        };
      }

      expect(negative(-1)).to.throw(RangeError, "Invalid value: -1. Expected a positive integer.");
      expect(negative(Number.MIN_SAFE_INTEGER)).to.throw(RangeError, "Invalid value: -9007199254740991. Expected a positive integer.");
    });

    it("should throw an error for invalid defaults", () => {
      function negative (defaultValue) {
        return () => {
          validate.positiveInteger(undefined, "age", defaultValue);
        };
      }

      expect(negative(-1)).to.throw(RangeError, "Invalid age: -1. Expected a positive integer.");
      expect(negative(Number.MIN_SAFE_INTEGER)).to.throw(RangeError, "Invalid age: -9007199254740991. Expected a positive integer.");
    });
  });

  describe("validate.object()", () => {
    it("should validate empty objects", () => {
      expect(validate.object({})).to.deep.equal({});
    });

    it("should validate object literals", () => {
      expect(validate.object({ foo: 1 })).to.deep.equal({ foo: 1 });
      expect(validate.object({ foo: "bar", biz: "baz" })).to.deep.equal({ foo: "bar", biz: "baz" });
    });

    it("should validate class instances", () => {
      expect(validate.object(/regex/)).to.be.an.instanceOf(RegExp);
      expect(validate.object([])).to.be.an.instanceOf(Array);
      expect(validate.object(new Array(1))).to.be.an.instanceOf(Array);
      expect(validate.object(new Object())).to.be.an.instanceOf(Object);
      expect(validate.object(new Boolean(false))).to.be.an.instanceOf(Boolean);
      expect(validate.object(new Number(123))).to.be.an.instanceOf(Number);
      expect(validate.object(new String())).to.be.an.instanceOf(String);
      expect(validate.object(new Date())).to.be.an.instanceOf(Date);
      expect(validate.object(new Map())).to.be.an.instanceOf(Map);
      expect(validate.object(new Set())).to.be.an.instanceOf(Set);
    });

    it("should validate default values", () => {
      expect(validate.object(undefined, "thing", { foo: 1 })).to.deep.equal({ foo: 1 });
      expect(validate.object(undefined, "thing", /regex/)).to.be.an.instanceOf(RegExp);
      expect(validate.object(undefined, "thing", [])).to.be.an.instanceOf(Array);
      expect(validate.object(undefined, "thing", new Array(1))).to.be.an.instanceOf(Array);
      expect(validate.object(undefined, "thing", new Object())).to.be.an.instanceOf(Object);
      expect(validate.object(undefined, "thing", new Boolean(false))).to.be.an.instanceOf(Boolean);
      expect(validate.object(undefined, "thing", new Number(123))).to.be.an.instanceOf(Number);
      expect(validate.object(undefined, "thing", new String())).to.be.an.instanceOf(String);
      expect(validate.object(undefined, "thing", new Date())).to.be.an.instanceOf(Date);
      expect(validate.object(undefined, "thing", new Map())).to.be.an.instanceOf(Map);
      expect(validate.object(undefined, "thing", new Set())).to.be.an.instanceOf(Set);
    });

    it("should throw an error for invalid values", () => {
      function invalid (value) {
        return () => {
          validate.object(value);
        };
      }

      expect(invalid(null)).to.throw(TypeError, "Invalid value: null. Expected an object.");
      expect(invalid(NaN)).to.throw(TypeError, "Invalid value: NaN. Expected an object.");
      expect(invalid(0)).to.throw(TypeError, "Invalid value: 0. Expected an object.");
      expect(invalid(Number.MAX_VALUE)).to.throw(TypeError, "Invalid value: 1.7976931348623157e+308. Expected an object.");
      expect(invalid(false)).to.throw(TypeError, "Invalid value: false. Expected an object.");
      expect(invalid(true)).to.throw(TypeError, "Invalid value: true. Expected an object.");
      expect(invalid("")).to.throw(TypeError, "Invalid value: \"\". Expected an object.");
      expect(invalid("Hello, world!")).to.throw(TypeError, "Invalid value: \"Hello, world!\". Expected an object.");
      expect(invalid(String)).to.throw(TypeError, "Invalid value: function. Expected an object.");
    });

    it("should throw an error for invalid defaults", () => {
      function invalidDefault (defaultValue) {
        return () => {
          validate.object(undefined, "thing", defaultValue);
        };
      }

      expect(invalidDefault(null)).to.throw(TypeError, "Invalid thing: null. Expected an object.");
      expect(invalidDefault(NaN)).to.throw(TypeError, "Invalid thing: NaN. Expected an object.");
      expect(invalidDefault(0)).to.throw(TypeError, "Invalid thing: 0. Expected an object.");
      expect(invalidDefault(Number.MAX_VALUE)).to.throw(TypeError, "Invalid thing: 1.7976931348623157e+308. Expected an object.");
      expect(invalidDefault(false)).to.throw(TypeError, "Invalid thing: false. Expected an object.");
      expect(invalidDefault(true)).to.throw(TypeError, "Invalid thing: true. Expected an object.");
      expect(invalidDefault("")).to.throw(TypeError, "Invalid thing: \"\". Expected an object.");
      expect(invalidDefault("Hello, world!")).to.throw(TypeError, "Invalid thing: \"Hello, world!\". Expected an object.");
      expect(invalidDefault(String)).to.throw(TypeError, "Invalid thing: function. Expected an object.");
    });
  });

  describe("validate.function()", () => {
    it("should validate all types of functions", () => {
      expect(validate.function(function foo () {})).to.be.a("function");
      expect(validate.function(function () {})).to.be.a("function");
      expect(validate.function(function* () {})).to.be.a("function");
      expect(validate.function(async function () {})).to.be.a("function");
      expect(validate.function(async function* () {})).to.be.a("function");
      expect(validate.function(() => {})).to.be.a("function");
      expect(validate.function(async () => {})).to.be.a("function");
      expect(validate.function(new Date().toUTCString)).to.be.a("function");
      expect(validate.function(class Foo {})).to.be.a("function");
    });

    it("should validate default values", () => {
      expect(validate.function(undefined, "method", function foo () {})).to.be.a("function");
      expect(validate.function(undefined, "method", function () {})).to.be.a("function");
      expect(validate.function(undefined, "method", function* () {})).to.be.a("function");
      expect(validate.function(undefined, "method", async function () {})).to.be.a("function");
      expect(validate.function(undefined, "method", async function* () {})).to.be.a("function");
      expect(validate.function(undefined, "method", () => {})).to.be.a("function");
      expect(validate.function(undefined, "method", async () => {})).to.be.a("function");
      expect(validate.function(undefined, "method", new Date().toUTCString)).to.be.a("function");
      expect(validate.function(undefined, "method", class Foo {})).to.be.a("function");
    });

    it("should throw an error for invalid values", () => {
      function invalid (value) {
        return () => {
          validate.function(value);
        };
      }

      expect(invalid(null)).to.throw(TypeError, "Invalid value: null. Expected a function.");
      expect(invalid(NaN)).to.throw(TypeError, "Invalid value: NaN. Expected a function.");
      expect(invalid(0)).to.throw(TypeError, "Invalid value: 0. Expected a function.");
      expect(invalid(Number.MAX_VALUE)).to.throw(TypeError, "Invalid value: 1.7976931348623157e+308. Expected a function.");
      expect(invalid(false)).to.throw(TypeError, "Invalid value: false. Expected a function.");
      expect(invalid(true)).to.throw(TypeError, "Invalid value: true. Expected a function.");
      expect(invalid("")).to.throw(TypeError, "Invalid value: \"\". Expected a function.");
      expect(invalid("Hello, world!")).to.throw(TypeError, "Invalid value: \"Hello, world!\". Expected a function.");
      expect(invalid(/regex/)).to.throw(TypeError, "Invalid value: /regex/. Expected a function.");
      expect(invalid(new Date())).to.throw(TypeError, "Invalid value: Date. Expected a function.");
    });

    it("should throw an error for invalid defaults", () => {
      function invalidDefault (defaultValue) {
        return () => {
          validate.function(undefined, "thing", defaultValue);
        };
      }

      expect(invalidDefault(null)).to.throw(TypeError, "Invalid thing: null. Expected a function.");
      expect(invalidDefault(NaN)).to.throw(TypeError, "Invalid thing: NaN. Expected a function.");
      expect(invalidDefault(0)).to.throw(TypeError, "Invalid thing: 0. Expected a function.");
      expect(invalidDefault(Number.MAX_VALUE)).to.throw(TypeError, "Invalid thing: 1.7976931348623157e+308. Expected a function.");
      expect(invalidDefault(false)).to.throw(TypeError, "Invalid thing: false. Expected a function.");
      expect(invalidDefault(true)).to.throw(TypeError, "Invalid thing: true. Expected a function.");
      expect(invalidDefault("")).to.throw(TypeError, "Invalid thing: \"\". Expected a function.");
      expect(invalidDefault("Hello, world!")).to.throw(TypeError, "Invalid thing: \"Hello, world!\". Expected a function.");
      expect(invalidDefault(/regex/)).to.throw(TypeError, "Invalid thing: /regex/. Expected a function.");
      expect(invalidDefault(new Date())).to.throw(TypeError, "Invalid thing: Date. Expected a function.");
    });
  });

  describe("validate.type()", () => {
    it("should validate special values that are in the list of allowed types", () => {
      expect(validate.type(null, [String, Boolean, null, Number])).to.equal(null);
      expect(validate.type(undefined, [String, Boolean, undefined, Number])).to.equal(undefined);
      expect(validate.type(NaN, [String, Boolean, NaN, Number])).to.satisfy(Number.isNaN);
    });

    it("should validate primitive values that are in the list of allowed types", () => {
      expect(validate.type("Hello, world!", [String, Boolean, null, Number])).to.equal("Hello, world!");
      expect(validate.type(12345, [String, Boolean, undefined, Number])).to.equal(12345);
      expect(validate.type(false, [String, Boolean, NaN, Number])).to.equal(false);
    });

    it("should validate wrapped primitive values that are in the list of allowed types", () => {
      expect(validate.type(new String("Hello, world!"), [String, Boolean, null, Number])).to.deep.equal(new String("Hello, world!"));
      expect(validate.type(new Number(12345), [String, Boolean, undefined, Number])).to.deep.equal(new Number(12345));
      expect(validate.type(new Boolean(false), [String, Boolean, NaN, Number])).to.deep.equal(new Boolean(false));
      expect(validate.type(BigInt(123456789), [String, Boolean, NaN, BigInt])).to.deep.equal(BigInt(123456789));
      expect(validate.type(Symbol("foo"), [String, Boolean, Symbol, Number])).to.be.a("symbol");
    });

    it("should validate values that are instances of allowed types", () => {
      expect(validate.type(/regex/, [String, Boolean, RegExp, Number])).to.be.an.instanceOf(RegExp);
      expect(validate.type(() => undefined, [String, Function, RegExp, Number])).to.be.a("function");
      expect(validate.type(new Date(), [String, Function, RegExp, Date])).to.be.an.instanceOf(Date);
      expect(validate.type(new Map(), [String, Function, Map, Date])).to.be.an.instanceOf(Map);
      expect(validate.type(new Set(), [String, Function, Set, Date])).to.be.an.instanceOf(Set);
      expect(validate.type(Buffer.alloc(0), [String, Buffer, RegExp, Date])).to.be.an.instanceOf(Buffer);
    });

    it("should validate default values", () => {
      expect(validate.type(undefined, [Number, BigInt], "count", 12345)).to.equal(12345);
      expect(validate.type(undefined, [Array, Map, Set], "list", [])).to.deep.equal([]);
      expect(validate.type(undefined, [String, RegExp], "pattern", /regex/)).to.deep.equal(/regex/);
    });

    it("should throw an error for special values that are not in the list of allowed types", () => {
      function notAllowed (value, allowed) {
        return () => {
          validate.type(value, allowed, "thing");
        };
      }

      expect(notAllowed(null, [String, undefined, Date, NaN]))
        .to.throw(TypeError, "Invalid thing: null. Expected string, Date, undefined, or NaN.");

      expect(notAllowed(undefined, [String, null, RegExp, NaN]))
        .to.throw(TypeError, "Invalid thing: undefined. Expected string, RegExp, null, or NaN.");

      expect(notAllowed(NaN, [Map, undefined, Buffer, null]))
        .to.throw(TypeError, "Invalid thing: NaN. Expected Map, Buffer, undefined, or null.");
    });

    it("should throw an error for primitive values that are not in the list of allowed types", () => {
      function notAllowed (value, allowed) {
        return () => {
          validate.type(value, allowed, "thing");
        };
      }

      expect(notAllowed("Hello, world!", [Number, RegExp, undefined, Date, NaN, Boolean]))
        .to.throw(TypeError, 'Invalid thing: "Hello, world!". Expected number, boolean, RegExp, Date, undefined, or NaN.');

      expect(notAllowed(12345, [String, RegExp, undefined, Date, NaN, Boolean]))
        .to.throw(TypeError, "Invalid thing: 12345. Expected string, boolean, RegExp, Date, undefined, or NaN.");

      expect(notAllowed(false, [String, RegExp, undefined, Date, NaN, Number]))
        .to.throw(TypeError, "Invalid thing: false. Expected string, number, RegExp, Date, undefined, or NaN.");

      expect(notAllowed(true, [String, RegExp, undefined, Date, NaN, Number]))
        .to.throw(TypeError, "Invalid thing: true. Expected string, number, RegExp, Date, undefined, or NaN.");
    });

    it("should throw an error for wrapped primitive values that are not in the list of allowed types", () => {
      function notAllowed (value, allowed) {
        return () => {
          validate.type(value, allowed, "thing");
        };
      }

      expect(notAllowed(new String("Hello, world!"), [Number, RegExp, undefined, Date, NaN, Boolean]))
        .to.throw(TypeError, "Invalid thing: Hello, world!. Expected number, boolean, RegExp, Date, undefined, or NaN.");

      expect(notAllowed(new Number(12345), [String, RegExp, undefined, Date, NaN, Boolean]))
        .to.throw(TypeError, "Invalid thing: 12345. Expected string, boolean, RegExp, Date, undefined, or NaN.");

      expect(notAllowed(new Boolean(false), [String, RegExp, undefined, Date, NaN, Number]))
        .to.throw(TypeError, "Invalid thing: false. Expected string, number, RegExp, Date, undefined, or NaN.");

      expect(notAllowed(BigInt(123456789), [String, RegExp, undefined, Date, NaN, Number]))
        .to.throw(TypeError, "Invalid thing: 123456789. Expected string, number, RegExp, Date, undefined, or NaN.");

      expect(notAllowed(Symbol("foo"), [String, RegExp, undefined, Date, NaN, Number]))
        .to.throw(TypeError, "Invalid thing: Symbol(foo). Expected string, number, RegExp, Date, undefined, or NaN.");
    });

    it("should throw an error for values that are not in the list of allowed types", () => {
      function notAllowed (value, allowed) {
        return () => {
          validate.type(value, allowed, "thing");
        };
      }

      expect(notAllowed(/regex/, [Number, Map, undefined, Date, NaN, Boolean]))
        .to.throw(TypeError, "Invalid thing: /regex/. Expected number, boolean, Map, Date, undefined, or NaN.");

      expect(notAllowed(() => undefined, [String, RegExp, undefined, Date, NaN, Number]))
        .to.throw(TypeError, "Invalid thing: () => undefined. Expected string, number, RegExp, Date, undefined, or NaN.");

      expect(notAllowed(new Date(), [String, RegExp, undefined, Symbol, NaN, Number]))
        .to.throw(TypeError, "Invalid thing: Date. Expected string, symbol, number, RegExp, undefined, or NaN.");

      expect(notAllowed(new Map(), [String, RegExp, undefined, Date, NaN, Number]))
        .to.throw(TypeError, "Invalid thing: Map. Expected string, number, RegExp, Date, undefined, or NaN.");

      expect(notAllowed(new Set([1, 2, 3]), [String, RegExp, Array, Date, Map, Number]))
        .to.throw(TypeError, "Invalid thing: Set. Expected string, number, RegExp, Array, Date, or Map.");

      expect(notAllowed(Buffer.alloc(0), [String, Map, Function, Array, Set, Number]))
        .to.throw(TypeError, "Invalid thing: Uint8Array. Expected string, number, Map, Function, Array, or Set.");
    });

  });

  describe("validate.oneOf()", () => {
    it("should validate values that are in the list of allowed values", () => {
      expect(validate.oneOf(1.0, [1, 2, 3, 4, 5])).to.equal(1);
      expect(validate.oneOf(false, [true, false])).to.equal(false);
      expect(validate.oneOf("Wilma", ["Fred", "Barney", "Wilma", "Betty"])).to.equal("Wilma");
    });

    it("should throw an error for values that are not in the list of allowed values", () => {
      function notAllowed (value, allowed) {
        return () => {
          validate.oneOf(value, allowed);
        };
      }

      expect(notAllowed(-1, [1, 2, 3, 4]))
        .to.throw(TypeError, "Invalid value: -1. Expected 1, 2, 3, or 4.");

      expect(notAllowed(0, [true, false]))
        .to.throw(TypeError, "Invalid value: 0. Expected true or false.");

      expect(notAllowed("Arnold", ["Fred", "Barney", "Wilma", "Betty"]))
        .to.throw(TypeError, 'Invalid value: "Arnold". Expected "Fred", "Barney", "Wilma", or "Betty"');
    });

    it("should throw an error for invalid defaults", () => {
      function badDefault (allowed, defaultValue) {
        return () => {
          validate.oneOf(undefined, allowed, "thing", defaultValue);
        };
      }

      expect(badDefault([1, 2, 3], Number.MAX_SAFE_INTEGER))
        .to.throw(TypeError, "Invalid thing: 9007199254740991. Expected 1, 2, or 3.");

      expect(badDefault([true, false], "true"))
        .to.throw(TypeError, 'Invalid thing: "true". Expected true or false.');

      expect(badDefault(["Fred", "Barney", "Wilma", "Betty"], /Wilma/))
        .to.throw(TypeError, 'Invalid thing: /Wilma/. Expected "Fred", "Barney", "Wilma", or "Betty"');
    });
  });

});
