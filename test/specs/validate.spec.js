"use strict";

const { validate } = require("../../");
const { expect } = require("chai");

describe("Validation functions", () => {

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

});
