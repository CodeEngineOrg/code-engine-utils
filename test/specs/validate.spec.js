"use strict";

const { validate } = require("../../");
const { expect } = require("chai");

describe("Validation functions", () => {

  describe("validate.string()", () => {
    it("should validate empty strings", () => {
      expect(validate.string("name", "")).to.equal("");
    });

    it("should validate whitespace strings", () => {
      expect(validate.string("name", " ")).to.equal(" ");
      expect(validate.string("name", "\t")).to.equal("\t");
      expect(validate.string("name", "\n")).to.equal("\n");
      expect(validate.string("name", "\t \n")).to.equal("\t \n");
    });

    it("should validate text strings", () => {
      expect(validate.string("name", "Hello, world")).to.equal("Hello, world");
    });

    it("should validate numeric strings", () => {
      expect(validate.string("name", "0")).to.equal("0");
      expect(validate.string("name", "123")).to.equal("123");
      expect(validate.string("name", "Infinity")).to.equal("Infinity");
    });

    it("should validate default values", () => {
      expect(validate.string("name", undefined, "")).to.equal("");
      expect(validate.string("name", undefined, "\t \n")).to.equal("\t \n");
      expect(validate.string("name", undefined, "Hello, world")).to.equal("Hello, world");
      expect(validate.string("name", undefined, "123")).to.equal("123");
    });

    it("should throw an error for invalid values", () => {
      function invalid (value) {
        return () => {
          validate.string("name", value);
        };
      }

      expect(invalid(NaN)).to.throw(TypeError, "Invalid name value: NaN. Expected a string.");
      expect(invalid(null)).to.throw(TypeError, "Invalid name value: null. Expected a string.");
      expect(invalid(undefined)).to.throw(TypeError, "Invalid name value: undefined. Expected a string.");
      expect(invalid(0)).to.throw(TypeError, "Invalid name value: 0. Expected a string.");
      expect(invalid(Number.MAX_VALUE)).to.throw(TypeError, "Invalid name value: 1.7976931348623157e+308. Expected a string.");
      expect(invalid(String)).to.throw(TypeError, "Invalid name value: function. Expected a string.");
      expect(invalid(new Date())).to.throw(TypeError, "Invalid name value: Date. Expected a string.");
      expect(invalid(/1234/)).to.throw(TypeError, "Invalid name value: /1234/. Expected a string.");
      expect(invalid({ foo: "bar" })).to.throw(TypeError, "Invalid name value: {foo}. Expected a string.");
      expect(invalid([1, 2, 3])).to.throw(TypeError, "Invalid name value: [1,2,3]. Expected a string.");
    });

    it("should throw an error for invalid defaults", () => {
      function invalidDefault (defaultValue) {
        return () => {
          validate.string("name", undefined, defaultValue);
        };
      }

      expect(invalidDefault(NaN)).to.throw(TypeError, "Invalid name value: NaN. Expected a string.");
      expect(invalidDefault(null)).to.throw(TypeError, "Invalid name value: null. Expected a string.");
      expect(invalidDefault(undefined)).to.throw(TypeError, "Invalid name value: undefined. Expected a string.");
      expect(invalidDefault(0)).to.throw(TypeError, "Invalid name value: 0. Expected a string.");
      expect(invalidDefault(Number.MAX_VALUE)).to.throw(TypeError, "Invalid name value: 1.7976931348623157e+308. Expected a string.");
      expect(invalidDefault(String)).to.throw(TypeError, "Invalid name value: function. Expected a string.");
      expect(invalidDefault(new Date())).to.throw(TypeError, "Invalid name value: Date. Expected a string.");
      expect(invalidDefault(/1234/)).to.throw(TypeError, "Invalid name value: /1234/. Expected a string.");
      expect(invalidDefault({ foo: "bar" })).to.throw(TypeError, "Invalid name value: {foo}. Expected a string.");
      expect(invalidDefault([1, 2, 3])).to.throw(TypeError, "Invalid name value: [1,2,3]. Expected a string.");
    });
  });

  describe("validate.minLength()", () => {
    it("should validate non-empty strings by default", () => {
      expect(validate.minLength("name", " ")).to.equal(" ");
      expect(validate.minLength("name", "\n")).to.equal("\n");
      expect(validate.minLength("name", "abc")).to.equal("abc");
      expect(validate.minLength("name", "Hello, world")).to.equal("Hello, world");
    });

    it("should validate strings that meet the minimum", () => {
      expect(validate.minLength("name", " ", 1)).to.equal(" ");
      expect(validate.minLength("name", "hello", 3)).to.equal("hello");
      expect(validate.minLength("name", "hello", 5)).to.equal("hello");
    });

    it("should validate default values", () => {
      expect(validate.minLength("name", undefined, 1, " ")).to.equal(" ");
      expect(validate.minLength("name", undefined, 3, "hello")).to.equal("hello");
      expect(validate.minLength("name", undefined, 5, "hello")).to.equal("hello");
    });

    it("should throw an error for empty strings by default", () => {
      function empty (value) {
        return () => {
          validate.minLength("name", value);
        };
      }

      expect(empty("")).to.throw(TypeError, 'Invalid name value: "". It cannot be empty.');
    });

    it("should throw an error for strings that don't meet the minimum", () => {
      function tooShort (value, minLength) {
        return () => {
          validate.minLength("name", value, minLength);
        };
      }

      expect(tooShort(" ", 2)).to.throw(TypeError, 'Invalid name value: " ". It should be at least 2 characters.');
      expect(tooShort("abc", 5)).to.throw(TypeError, 'Invalid name value: "abc". It should be at least 5 characters.');
      expect(tooShort("Hello, world!", 100)).to.throw(TypeError, 'Invalid name value: "Hello, world!". It should be at least 100 characters.');
    });

    it("should throw an error for defaults that don't meet the minimum", () => {
      function invalidDefault (defaultValue, minLength) {
        return () => {
          validate.minLength("name", undefined, minLength, defaultValue);
        };
      }

      expect(invalidDefault(" ", 2)).to.throw(TypeError, 'Invalid name value: " ". It should be at least 2 characters.');
      expect(invalidDefault("abc", 5)).to.throw(TypeError, 'Invalid name value: "abc". It should be at least 5 characters.');
      expect(invalidDefault("Hello, world!", 100)).to.throw(TypeError, 'Invalid name value: "Hello, world!". It should be at least 100 characters.');
    });
  });

  describe("validate.number()", () => {
    it("should validate numbers", () => {
      expect(validate.number("latitude", 1.0)).to.equal(1);
      expect(validate.number("latitude", 42)).to.equal(42);
      expect(validate.number("latitude", -100)).to.equal(-100);
      expect(validate.number("latitude", -1.234)).to.equal(-1.234);
      expect(validate.number("latitude", Number.MIN_VALUE)).to.equal(Number.MIN_VALUE);
      expect(validate.number("latitude", Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.number("latitude", Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
      expect(validate.number("latitude", Number.EPSILON)).to.equal(Number.EPSILON);
    });

    it("should validate default values", () => {
      expect(validate.number("latitude", undefined, 1.0)).to.equal(1);
      expect(validate.number("latitude", undefined, 42)).to.equal(42);
      expect(validate.number("latitude", undefined, -100)).to.equal(-100);
      expect(validate.number("latitude", undefined, -1.234)).to.equal(-1.234);
      expect(validate.number("latitude", undefined, Number.MIN_VALUE)).to.equal(Number.MIN_VALUE);
      expect(validate.number("latitude", undefined, Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.number("latitude", undefined, Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
      expect(validate.number("latitude", undefined, Number.EPSILON)).to.equal(Number.EPSILON);
    });

    it("should throw an error for invalid values", () => {
      function invalid (value) {
        return () => {
          validate.number("latitude", value);
        };
      }

      expect(invalid(NaN)).to.throw(TypeError, "Invalid latitude value: NaN. Expected a number.");
      expect(invalid(null)).to.throw(TypeError, "Invalid latitude value: null. Expected a number.");
      expect(invalid(undefined)).to.throw(TypeError, "Invalid latitude value: undefined. Expected a number.");
      expect(invalid("")).to.throw(TypeError, "Invalid latitude value: \"\". Expected a number.");
      expect(invalid("Hello, World")).to.throw(TypeError, "Invalid latitude value: \"Hello, World\". Expected a number.");
      expect(invalid(new Date())).to.throw(TypeError, "Invalid latitude value: Date. Expected a number.");
      expect(invalid(/1234/)).to.throw(TypeError, "Invalid latitude value: /1234/. Expected a number.");
      expect(invalid({ foo: "bar" })).to.throw(TypeError, "Invalid latitude value: {foo}. Expected a number.");
      expect(invalid([1, 2, 3])).to.throw(TypeError, "Invalid latitude value: [1,2,3]. Expected a number.");
    });

    it("should throw an error for invalid defaults", () => {
      function negative (defaultValue) {
        return () => {
          validate.number("latitude", undefined, defaultValue);
        };
      }

      expect(negative(NaN)).to.throw(TypeError, "Invalid latitude value: NaN. Expected a number.");
      expect(negative("")).to.throw(TypeError, "Invalid latitude value: \"\". Expected a number.");
      expect(negative(new Date())).to.throw(TypeError, "Invalid latitude value: Date. Expected a number.");
    });
  });

  describe("validate.integer()", () => {
    it("should validate integers", () => {
      expect(validate.integer("offset", 1.0)).to.equal(1);
      expect(validate.integer("offset", 42)).to.equal(42);
      expect(validate.integer("offset", -100)).to.equal(-100);
      expect(validate.integer("offset", -1)).to.equal(-1);
      expect(validate.integer("offset", Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.integer("offset", Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
    });

    it("should throw an error for fractional numbers", () => {
      function fraction (value) {
        return () => {
          validate.integer("offset", value);
        };
      }

      expect(fraction(1.1)).to.throw(TypeError, "Invalid offset value: 1.1. Expected an integer.");
      expect(fraction(-1.234)).to.throw(TypeError, "Invalid offset value: -1.234. Expected an integer.");
      expect(fraction(Math.PI)).to.throw(TypeError, "Invalid offset value: 3.141592653589793. Expected an integer.");
      expect(fraction(Number.EPSILON)).to.throw(TypeError, "Invalid offset value: 2.220446049250313e-16. Expected an integer.");
    });

    it("should throw an error for non-finite numbers", () => {
      function infinite (value) {
        return () => {
          validate.integer("offset", value);
        };
      }

      expect(infinite(Infinity)).to.throw(TypeError, "Invalid offset value: Infinity. Expected an integer.");
      expect(infinite(-Infinity)).to.throw(TypeError, "Invalid offset value: -Infinity. Expected an integer.");
    });

    it("should throw an error for invalid defaults", () => {
      function negative (defaultValue) {
        return () => {
          validate.integer("offset", undefined, defaultValue);
        };
      }

      expect(negative(Infinity)).to.throw(TypeError, "Invalid offset value: Infinity. Expected an integer.");
      expect(negative(Number.EPSILON)).to.throw(TypeError, "Invalid offset value: 2.220446049250313e-16. Expected an integer.");
    });
  });

  describe("validate.positiveInteger()", () => {
    it("should validate positive integers", () => {
      expect(validate.positiveInteger("age", 1.0)).to.equal(1);
      expect(validate.positiveInteger("age", 42)).to.equal(42);
      expect(validate.positiveInteger("age", 100)).to.equal(100);
      expect(validate.positiveInteger("age", Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.positiveInteger("age", Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
    });

    it("should throw an error for negative numbers", () => {
      function negative (value) {
        return () => {
          validate.positiveInteger("age", value);
        };
      }

      expect(negative(-1)).to.throw(RangeError, "Invalid age value: -1. Expected a positive integer.");
      expect(negative(Number.MIN_SAFE_INTEGER)).to.throw(RangeError, "Invalid age value: -9007199254740991. Expected a positive integer.");
    });

    it("should throw an error for invalid defaults", () => {
      function negative (defaultValue) {
        return () => {
          validate.positiveInteger("age", undefined, defaultValue);
        };
      }

      expect(negative(-1)).to.throw(RangeError, "Invalid age value: -1. Expected a positive integer.");
      expect(negative(Number.MIN_SAFE_INTEGER)).to.throw(RangeError, "Invalid age value: -9007199254740991. Expected a positive integer.");
    });
  });

  describe("validate.oneOf()", () => {
    it("should validate values that are in the list of allowed values", () => {
      expect(validate.oneOf("count", 1.0, [1, 2, 3, 4, 5])).to.equal(1);
      expect(validate.oneOf("option", false, [true, false])).to.equal(false);
      expect(validate.oneOf("name", "Wilma", ["Fred", "Barney", "Wilma", "Betty"])).to.equal("Wilma");
    });

    it("should throw an error for values that are not in the list of allowed values", () => {
      function notAllowed (value, allowed) {
        return () => {
          validate.oneOf("thing", value, allowed);
        };
      }

      expect(notAllowed(-1, [1, 2, 3, 4]))
        .to.throw(TypeError, "Invalid thing value: -1. Expected 1, 2, 3, or 4.");

      expect(notAllowed(0, [true, false]))
        .to.throw(TypeError, "Invalid thing value: 0. Expected true or false.");

      expect(notAllowed("Arnold", ["Fred", "Barney", "Wilma", "Betty"]))
        .to.throw(TypeError, 'Invalid thing value: "Arnold". Expected "Fred", "Barney", "Wilma", or "Betty"');
    });

    it("should throw an error for invalid defaults", () => {
      function badDefault (allowed, defaultValue) {
        return () => {
          validate.oneOf("thing", undefined, allowed, defaultValue);
        };
      }

      expect(badDefault([1, 2, 3], Number.MAX_SAFE_INTEGER))
        .to.throw(TypeError, "Invalid thing value: 9007199254740991. Expected 1, 2, or 3.");

      expect(badDefault([true, false], "true"))
        .to.throw(TypeError, 'Invalid thing value: "true". Expected true or false.');

      expect(badDefault(["Fred", "Barney", "Wilma", "Betty"], /Wilma/))
        .to.throw(TypeError, 'Invalid thing value: /Wilma/. Expected "Fred", "Barney", "Wilma", or "Betty"');
    });
  });

});
