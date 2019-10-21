"use strict";

const { validate } = require("../../");
const { expect } = require("chai");

describe("Validation functions", () => {

  describe("validate.concurrency()", () => {

    it("should validate positive integers", () => {
      expect(validate.concurrency(1.0)).to.equal(1);
      expect(validate.concurrency(42)).to.equal(42);
      expect(validate.concurrency(100)).to.equal(100);
      expect(validate.concurrency(Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.concurrency(Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
    });

    it("should validate default values", () => {
      expect(validate.concurrency(undefined, 1.0)).to.equal(1);
      expect(validate.concurrency(undefined, 42)).to.equal(42);
      expect(validate.concurrency(undefined, 100)).to.equal(100);
      expect(validate.concurrency(undefined, Number.MAX_VALUE)).to.equal(Number.MAX_VALUE);
      expect(validate.concurrency(undefined, Number.MAX_SAFE_INTEGER)).to.equal(Number.MAX_SAFE_INTEGER);
    });

    it("should throw an error for negative numbers", () => {
      function negative (value) {
        return () => {
          validate.concurrency(value);
        };
      }

      expect(negative(-1)).to.throw(RangeError, "Concurrency must be a positive integer, not -1.");
      expect(negative(-Infinity)).to.throw(RangeError, "Concurrency must be a positive integer, not -Infinity.");
      expect(negative(Number.MIN_SAFE_INTEGER)).to.throw(RangeError, "Concurrency must be a positive integer, not -9007199254740991.");
      expect(negative(Number.MIN_VALUE)).to.throw(RangeError, "Concurrency must be a positive integer, not 5e-324.");
    });

    it("should throw an error for fractional numbers", () => {
      function fraction (value) {
        return () => {
          validate.concurrency(value);
        };
      }

      expect(fraction(1.1)).to.throw(RangeError, "Concurrency must be a positive integer, not 1.1.");
      expect(fraction(Math.PI)).to.throw(RangeError, "Concurrency must be a positive integer, not 3.141592653589793.");
      expect(fraction(Number.EPSILON)).to.throw(RangeError, "Concurrency must be a positive integer, not 2.220446049250313e-16.");
    });

    it("should throw an error for non-finite numbers", () => {
      function infinite (value) {
        return () => {
          validate.concurrency(value);
        };
      }

      expect(infinite(Infinity)).to.throw(RangeError, "Concurrency must be a positive integer, not Infinity.");
      expect(infinite(-Infinity)).to.throw(RangeError, "Concurrency must be a positive integer, not -Infinity.");
    });

    it("should throw an error for invalid values", () => {
      function invalid (value) {
        return () => {
          validate.concurrency(value);
        };
      }

      expect(invalid(NaN)).to.throw(RangeError, "Concurrency must be a positive integer, not NaN.");
      expect(invalid(null)).to.throw(TypeError, "Concurrency must be a positive integer, not null.");
      expect(invalid(undefined)).to.throw(TypeError, "Concurrency must be a positive integer, not undefined.");
      expect(invalid("")).to.throw(TypeError, "Concurrency must be a positive integer, not a string.");
      expect(invalid("Hello, World")).to.throw(TypeError, "Concurrency must be a positive integer, not a string.");
      expect(invalid(new Date())).to.throw(TypeError, "Concurrency must be a positive integer, not a Date");
      expect(invalid(/1234/)).to.throw(TypeError, "Concurrency must be a positive integer, not /1234/.");
      expect(invalid({ foo: "bar" })).to.throw(TypeError, "Concurrency must be a positive integer, not {foo}.");
      expect(invalid([1, 2, 3])).to.throw(TypeError, "Concurrency must be a positive integer, not 1,2,3.");
    });

    it("should throw an error for invalid defaults", () => {
      function negative (defaultValue) {
        return () => {
          validate.concurrency(undefined, defaultValue);
        };
      }

      expect(negative(-1)).to.throw(RangeError, "Concurrency must be a positive integer, not -1.");
      expect(negative(NaN)).to.throw(RangeError, "Concurrency must be a positive integer, not NaN.");
      expect(negative(Infinity)).to.throw(RangeError, "Concurrency must be a positive integer, not Infinity.");
      expect(negative(Number.EPSILON)).to.throw(RangeError, "Concurrency must be a positive integer, not 2.220446049250313e-16.");
      expect(negative("")).to.throw(TypeError, "Concurrency must be a positive integer, not a string.");
      expect(negative(new Date())).to.throw(TypeError, "Concurrency must be a positive integer, not a Date.");
    });

  });

});
