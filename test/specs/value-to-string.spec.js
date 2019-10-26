/* eslint-disable no-new-func, no-new-wrappers, no-new-object, no-array-constructor */
/* global BigInt */
"use strict";

const { valueToString } = require("../../");
const { expect } = require("chai");

describe("valueToString() function", () => {

  describe("special values", () => {
    it("should output null as null", () => {
      expect(valueToString(null)).to.equal("null");
      expect(valueToString(null, { capitalize: true })).to.equal("Null");
      expect(valueToString(null, { article: true })).to.equal("null");
      expect(valueToString(null, { article: true, capitalize: true })).to.equal("Null");
    });

    it("should output undefined as undefined", () => {
      expect(valueToString(undefined)).to.equal("undefined");
      expect(valueToString(undefined, { capitalize: true })).to.equal("Undefined");
      expect(valueToString(undefined, { article: true })).to.equal("undefined");
      expect(valueToString(undefined, { article: true, capitalize: true })).to.equal("Undefined");
    });

    it("should output NaN as NaN", () => {
      expect(valueToString(NaN)).to.equal("NaN");
      expect(valueToString(Number.NaN)).to.equal("NaN");
      expect(valueToString(NaN, { capitalize: true })).to.equal("NaN");
      expect(valueToString(NaN, { article: true })).to.equal("NaN");
      expect(valueToString(NaN, { article: true, capitalize: true })).to.equal("NaN");
    });
  });

  describe("numbers", () => {
    it("should output short numbers as values", () => {
      expect(valueToString(1.0)).to.equal("1");
      expect(valueToString(-1.0)).to.equal("-1");
      expect(valueToString(42)).to.equal("42");
      expect(valueToString(BigInt(100))).to.equal("100");
      expect(valueToString(1000000000)).to.equal("1000000000");
      expect(valueToString(1000000000000000000000000)).to.equal("1e+24");
      expect(valueToString(-100000000)).to.equal("-100000000");
      expect(valueToString(-100000000000000000000000)).to.equal("-1e+23");
      expect(valueToString(1.23456789)).to.equal("1.23456789");
      expect(valueToString(1.234567891234567890123456789)).to.equal("1.234567891234568");
      expect(valueToString(-1.2345678)).to.equal("-1.2345678");
      expect(valueToString(-1.2345678901234567890123456789)).to.equal("-1.2345678901234567");
      expect(valueToString(Number.MIN_VALUE)).to.equal("5e-324");
      expect(valueToString(Number.MAX_VALUE)).to.equal("1.7976931348623157e+308");
      expect(valueToString(Number.MIN_SAFE_INTEGER)).to.equal("-9007199254740991");
      expect(valueToString(Number.MAX_SAFE_INTEGER)).to.equal("9007199254740991");
      expect(valueToString(Number.EPSILON)).to.equal("2.220446049250313e-16");
      expect(valueToString(Infinity)).to.equal("Infinity");
      expect(valueToString(-Infinity)).to.equal("-Infinity");
    });

    it("should output very long numbers as a type", () => {
      expect(valueToString(BigInt(1000000000000000000000000000))).to.equal("bigint");
      expect(valueToString(10000000000, { maxLength: 10 })).to.equal("number");
      expect(valueToString(-1000000000, { maxLength: 10 })).to.equal("number");
      expect(valueToString(1.234567891234567890123456789, { maxLength: 10 })).to.equal("number");
      expect(valueToString(-1.2345678901234567890123456789, { maxLength: 10 })).to.equal("number");
      expect(valueToString(Number.MAX_VALUE, { maxLength: 10 })).to.equal("number");
      expect(valueToString(Number.MIN_SAFE_INTEGER, { maxLength: 10 })).to.equal("number");
      expect(valueToString(Number.MAX_SAFE_INTEGER, { maxLength: 10 })).to.equal("number");
      expect(valueToString(Number.EPSILON, { maxLength: 10 })).to.equal("number");
    });

    it("should capitalize numeric types", () => {
      expect(valueToString(-1.23456789, { maxLength: 10, capitalize: true })).to.equal("Number");
      expect(valueToString(BigInt(123456789012345), { maxLength: 10, capitalize: true })).to.equal("Bigint");
    });

    it("should not capitalize numeric values", () => {
      expect(valueToString(42, { capitalize: true })).to.equal("42");
      expect(valueToString(BigInt(100), { capitalize: true })).to.equal("100");
      expect(valueToString(1000000000, { capitalize: true })).to.equal("1000000000");
      expect(valueToString(-1.2345678, { capitalize: true })).to.equal("-1.2345678");
    });

    it("should prefix numeric types with articles", () => {
      expect(valueToString(-1.23456789, { maxLength: 5, article: true })).to.equal("a number");
      expect(valueToString(BigInt(123456789012345), { maxLength: 5, article: true })).to.equal("a bigint");
      expect(valueToString(-1.23456789, { capitalize: true, maxLength: 5, article: true })).to.equal("A number");
      expect(valueToString(BigInt(123456789012345), { capitalize: true, maxLength: 5, article: true })).to.equal("A bigint");
    });

    it("should not prefix numeric values with articles", () => {
      expect(valueToString(42, { article: true })).to.equal("42");
      expect(valueToString(BigInt(100), { article: true })).to.equal("100");
      expect(valueToString(1000000000, { article: true })).to.equal("1000000000");
      expect(valueToString(-1.2345678, { article: true })).to.equal("-1.2345678");
    });
  });

  describe("strings", () => {
    it("should output short strings as values", () => {
      expect(valueToString("")).to.equal('""');
      expect(valueToString("Hello, world!")).to.equal('"Hello, world!"');
      expect(valueToString("John Doe")).to.equal('"John Doe"');
      expect(valueToString("1234567890")).to.equal('"1234567890"');
    });

    it("should output long strings with an elipsis", () => {
      expect(valueToString("This is a really really long string.")).to.equal('"This is a really reall..."');
      expect(valueToString("Hello, world!", { maxLength: 10 })).to.equal('"Hello, ..."');
    });

    it("should not capitalize string values", () => {
      expect(valueToString("hello, world", { capitalize: true })).to.equal('"hello, world"');
      expect(valueToString("John Doe", { capitalize: true })).to.equal('"John Doe"');
      expect(valueToString("This is a really really long string.", { capitalize: true })).to.equal('"This is a really reall..."');
    });

    it("should not prefix string values with articles", () => {
      expect(valueToString("hello, world", { article: true })).to.equal('"hello, world"');
      expect(valueToString("John Doe", { article: true })).to.equal('"John Doe"');
      expect(valueToString("This is a really really long string.", { article: true })).to.equal('"This is a really reall..."');
    });
  });

  describe("booleans", () => {
    it("should output booleans as values", () => {
      expect(valueToString(true)).to.equal("true");
      expect(valueToString(false)).to.equal("false");
    });

    it("should capitalize boolean values", () => {
      expect(valueToString(true, { capitalize: true })).to.equal("True");
      expect(valueToString(false, { capitalize: true })).to.equal("False");
    });

    it("should not prefix boolean values with articles", () => {
      expect(valueToString(true, { article: true })).to.equal("true");
      expect(valueToString(false, { article: true })).to.equal("false");
      expect(valueToString(true, { capitalize: true, article: true })).to.equal("True");
      expect(valueToString(false, { capitalize: true, article: true })).to.equal("False");
    });
  });

  describe("functions", () => {
    it("should output short functions as values", () => {
      expect(valueToString(() => 0)).to.equal("() => 0");
      expect(valueToString((x) => x)).to.equal("(x) => x");
      expect(valueToString(function () {})).to.equal("function () {}");
      expect(valueToString(class X {})).to.equal("class X {}");
    });

    it("should output long functions as a type", () => {
      expect(valueToString(() => undefined, { maxLength: 5 })).to.equal("function");
      expect(valueToString(Object.prototype.valueOf)).to.equal("function");
      expect(valueToString(function () { return 1234567890; })).to.equal("function");
      expect(valueToString(class Foo { constructor () { this.x = 4; }})).to.equal("function");
    });

    it("should capitalize function types", () => {
      expect(valueToString(() => undefined, { maxLength: 5, capitalize: true })).to.equal("Function");
      expect(valueToString(Object.prototype.valueOf, { capitalize: true })).to.equal("Function");
      expect(valueToString(function () { return 1234567890; }, { capitalize: true })).to.equal("Function");
      expect(valueToString(class Foo { constructor () { this.x = 4; }}, { capitalize: true })).to.equal("Function");
    });

    it("should not capitalize function values", () => {
      expect(valueToString(() => 0, { capitalize: true })).to.equal("() => 0");
      expect(valueToString(x => x, { capitalize: true })).to.equal("x => x");
      expect(valueToString(class X {}, { capitalize: true })).to.equal("class X {}");
    });

    it("should prefix function types with articles", () => {
      expect(valueToString(() => undefined, { maxLength: 5, article: true })).to.equal("a function");
      expect(valueToString(function () { return 1234567890; }, { article: true })).to.equal("a function");
      expect(valueToString(Object.prototype.valueOf, { article: true })).to.equal("a function");
      expect(valueToString(() => undefined, { maxLength: 5, capitalize: true, article: true })).to.equal("A function");
      expect(valueToString(function () { return 1234567890; }, { capitalize: true, article: true })).to.equal("A function");
      expect(valueToString(Object.prototype.valueOf, { capitalize: true, article: true })).to.equal("A function");
    });

    it("should not prefix function values with articles", () => {
      expect(valueToString(() => 0, { article: true })).to.equal("() => 0");
      expect(valueToString(x => x, { article: true })).to.equal("x => x");
      expect(valueToString(class X {}, { article: true })).to.equal("class X {}");
    });
  });

  describe("objects", () => {
    it("should output built-in objects as their underlying values", () => {
      expect(valueToString(new Number(12345))).to.equal("12345");
      expect(valueToString(new Boolean(true))).to.equal("true");
      expect(valueToString(new Boolean(false))).to.equal("false");
      expect(valueToString(new String("hello"))).to.equal("hello");
      expect(valueToString(new RegExp("^xyz$"))).to.equal("/^xyz$/");
      expect(valueToString(Array.of(1))).to.equal("[1]");
      expect(valueToString(new Array(1, 2, 3, 4))).to.equal("[1,2,3,4]");
      expect(valueToString(new Object({}))).to.equal("{}");
      expect(valueToString({})).to.equal("{}");
      expect(valueToString({ x: 1, y: 2 })).to.equal("{x,y}");
      expect(valueToString(new Object({ toString: () => "obj" }))).to.equal("obj");
    });

    it("should output built-in objects as types when too long", () => {
      expect(valueToString(new Date("2005-05-05T05:05:05.005Z"))).to.equal("Date");
      expect(valueToString(new RegExp("^(really really long regexp)$"))).to.equal("RegExp");
      expect(valueToString(new Object({ reallyLongKeyName1: 1, reallyLongKeyName2: 2 }))).to.equal("Object");
      expect(valueToString({ reallyLongKeyName1: 1, reallyLongKeyName2: 2 })).to.equal("Object");
      expect(valueToString(new Array())).to.equal("Array");
      expect(valueToString([])).to.equal("Array");
      expect(valueToString([new Date(), new Date()])).to.equal("Array");
      expect(valueToString(new Map())).to.equal("Map");
      expect(valueToString(new Set())).to.equal("Set");
    });

    it("should capitalize object types", () => {
      expect(valueToString(new Number(123456789012345), { maxLength: 5, capitalize: true })).to.equal("Number");
      expect(valueToString(new Date("2005-05-05T05:05:05.005Z"), { capitalize: true })).to.equal("Date");
      expect(valueToString(new RegExp("^(really really long regexp)$"), { capitalize: true })).to.equal("RegExp");
      expect(valueToString(new Object({ reallyLongKeyName1: 1, reallyLongKeyName2: 2 }), { capitalize: true })).to.equal("Object");
      expect(valueToString({ reallyLongKeyName1: 1, reallyLongKeyName2: 2 }, { capitalize: true })).to.equal("Object");
      expect(valueToString(new Array(0), { capitalize: true })).to.equal("Array");
      expect(valueToString([], { capitalize: true })).to.equal("Array");
      expect(valueToString([new Date(), new Date()])).to.equal("Array");
      expect(valueToString(new Map(), { capitalize: true })).to.equal("Map");
      expect(valueToString(new Set(), { capitalize: true })).to.equal("Set");
    });

    it("should capitalize object values", () => {
      expect(valueToString(new Boolean(true), { capitalize: true })).to.equal("True");
      expect(valueToString(new Boolean(false), { capitalize: true })).to.equal("False");
      expect(valueToString(new String("hello"), { capitalize: true })).to.equal("Hello");
      expect(valueToString(new RegExp("^xyz$"), { capitalize: true })).to.equal("/^xyz$/");
      expect(valueToString({})).to.equal("{}");
      expect(valueToString({ x: 1, y: 2 })).to.equal("{x,y}");
      expect(valueToString(new Object({ toString: () => "obj" }))).to.equal("obj");
    });

    it("should prefix object types with articles", () => {
      expect(valueToString(new Number(123456789012345), { maxLength: 5, article: true })).to.equal("a Number");
      expect(valueToString(new Date("2005-05-05T05:05:05.005Z"), { article: true })).to.equal("a Date");
      expect(valueToString(new RegExp("^(really really long regexp)$"), { article: true })).to.equal("a RegExp");
      expect(valueToString(new Object({ reallyLongKeyName1: 1, reallyLongKeyName2: 2 }), { article: true })).to.equal("an Object");
      expect(valueToString({ reallyLongKeyName1: 1, reallyLongKeyName2: 2 }, { article: true })).to.equal("an Object");
      expect(valueToString(new Array(0), { article: true })).to.equal("an Array");
      expect(valueToString([], { article: true })).to.equal("an Array");
      expect(valueToString([new Date(), new Date()], { article: true })).to.equal("an Array");
      expect(valueToString(new Map(), { article: true })).to.equal("a Map");
      expect(valueToString(new Set(), { article: true })).to.equal("a Set");

      expect(valueToString(new Number(123456789012345), { maxLength: 5, capitalize: true, article: true })).to.equal("A Number");
      expect(valueToString(new Date("2005-05-05T05:05:05.005Z"), { capitalize: true, article: true })).to.equal("A Date");
      expect(valueToString(new RegExp("^(really really long regexp)$"), { capitalize: true, article: true })).to.equal("A RegExp");
      expect(valueToString(new Object({ reallyLongKeyName1: 1, reallyLongKeyName2: 2 }), { capitalize: true, article: true })).to.equal("An Object");
      expect(valueToString({ reallyLongKeyName1: 1, reallyLongKeyName2: 2 }, { capitalize: true, article: true })).to.equal("An Object");
      expect(valueToString(new Array(0), { capitalize: true, article: true })).to.equal("An Array");
      expect(valueToString([], { capitalize: true, article: true })).to.equal("An Array");
      expect(valueToString([new Date(), new Date()], { capitalize: true, article: true })).to.equal("An Array");
      expect(valueToString(new Map(), { capitalize: true, article: true })).to.equal("A Map");
      expect(valueToString(new Set(), { capitalize: true, article: true })).to.equal("A Set");
    });

    it("should not prefix object values with articles", () => {
      expect(valueToString(new Boolean(true), { article: true })).to.equal("true");
      expect(valueToString(new Boolean(false), { article: true })).to.equal("false");
      expect(valueToString(new String("Hello, world!"), { article: true })).to.equal("Hello, world!");
      expect(valueToString(new RegExp("^xyz$"), { article: true })).to.equal("/^xyz$/");
      expect(valueToString(Array.of(1), { article: true })).to.equal("[1]");
      expect(valueToString(new Array(1, 2, 3, 4), { article: true })).to.equal("[1,2,3,4]");
      expect(valueToString({}, { article: true })).to.equal("{}");
      expect(valueToString({ x: 1, y: 2 }, { article: true })).to.equal("{x,y}");
      expect(valueToString(new Object({ toString: () => "obj" }, { article: true }))).to.equal("obj");

      expect(valueToString(new Boolean(true), { capitalize: true, article: true })).to.equal("True");
      expect(valueToString(new Boolean(false), { capitalize: true, article: true })).to.equal("False");
      expect(valueToString(new String("hello, world!"), { capitalize: true, article: true })).to.equal("Hello, world!");
      expect(valueToString(new RegExp("^xyz$"), { capitalize: true, article: true })).to.equal("/^xyz$/");
      expect(valueToString(Array.of(1), { capitalize: true, article: true })).to.equal("[1]");
      expect(valueToString(new Array(1, 2, 3, 4), { capitalize: true, article: true })).to.equal("[1,2,3,4]");
      expect(valueToString({}, { capitalize: true, article: true })).to.equal("{}");
      expect(valueToString({ x: 1, y: 2 }, { capitalize: true, article: true })).to.equal("{x,y}");
      expect(valueToString(new Object({ toString: () => "obj" }, { capitalize: true, article: true }))).to.equal("obj");
    });
  });
});
