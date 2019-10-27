"use strict";

const { valuesToString } = require("../../lib");
const { expect } = require("chai");

describe("valuesToString() function", () => {

  it("should join a list that only contains one value", () => {
    expect(valuesToString([undefined])).to.equal("undefined");
    expect(valuesToString([null])).to.equal("null");
    expect(valuesToString([NaN])).to.equal("NaN");
    expect(valuesToString([0])).to.equal("0");
    expect(valuesToString([false])).to.equal("false");
    expect(valuesToString([true])).to.equal("true");
    expect(valuesToString([""])).to.equal('""');
    expect(valuesToString(["Fred"])).to.equal('"Fred"');
    expect(valuesToString([{}])).to.equal("{}");
    expect(valuesToString([/^regex$/])).to.equal("/^regex$/");
    expect(valuesToString([new Date()])).to.equal("Date");
  });

  it("should not use the conjunction if the list only has one value", () => {
    expect(valuesToString([undefined], { conjunction: "or" })).to.equal("undefined");
    expect(valuesToString([null], { conjunction: "or" })).to.equal("null");
    expect(valuesToString([NaN], { conjunction: "or" })).to.equal("NaN");
    expect(valuesToString([0], { conjunction: "or" })).to.equal("0");
    expect(valuesToString([false], { conjunction: "or" })).to.equal("false");
    expect(valuesToString([true], { conjunction: "or" })).to.equal("true");
    expect(valuesToString([""], { conjunction: "or" })).to.equal('""');
    expect(valuesToString(["Fred"], { conjunction: "or" })).to.equal('"Fred"');
    expect(valuesToString([{}], { conjunction: "or" })).to.equal("{}");
    expect(valuesToString([/^regex$/], { conjunction: "or" })).to.equal("/^regex$/");
    expect(valuesToString([new Date()], { conjunction: "or" })).to.equal("Date");
  });

  it("should join a list that only contains two values", () => {
    expect(valuesToString([null, undefined])).to.equal("null and undefined");
    expect(valuesToString([NaN, NaN])).to.equal("NaN and NaN");
    expect(valuesToString([0, 1])).to.equal("0 and 1");
    expect(valuesToString([true, false])).to.equal("true and false");
    expect(valuesToString(["", ""])).to.equal('"" and ""');
    expect(valuesToString(["Fred", "Wilma"])).to.equal('"Fred" and "Wilma"');
    expect(valuesToString([{}, { foo: 1 }])).to.equal("{} and {foo}");
    expect(valuesToString([/^regex$/, new Date()])).to.equal("/^regex$/ and Date");
  });

  it("should use the conjunction when the list has two values", () => {
    expect(valuesToString([null, undefined], { conjunction: "or" })).to.equal("null or undefined");
    expect(valuesToString([NaN, NaN], { conjunction: "or" })).to.equal("NaN or NaN");
    expect(valuesToString([0, 1], { conjunction: "or" })).to.equal("0 or 1");
    expect(valuesToString([true, false], { conjunction: "or" })).to.equal("true or false");
    expect(valuesToString(["", ""], { conjunction: "or" })).to.equal('"" or ""');
    expect(valuesToString(["Fred", "Wilma"], { conjunction: "or" })).to.equal('"Fred" or "Wilma"');
    expect(valuesToString([{}, { foo: 1 }], { conjunction: "or" })).to.equal("{} or {foo}");
    expect(valuesToString([/^regex$/, new Date()], { conjunction: "or" })).to.equal("/^regex$/ or Date");
  });

  it("should join a list that only contains three values", () => {
    expect(valuesToString([null, undefined, NaN])).to.equal("null, undefined, and NaN");
    expect(valuesToString([0, 1, 2])).to.equal("0, 1, and 2");
    expect(valuesToString([true, false, "maybe"])).to.equal('true, false, and "maybe"');
    expect(valuesToString(["Fred", "Wilma", "Pebbles"])).to.equal('"Fred", "Wilma", and "Pebbles"');
    expect(valuesToString([{}, { foo: 1 }, { foo: 1, bar: 2 }])).to.equal("{}, {foo}, and {foo,bar}");
    expect(valuesToString([/^regex$/, new Date(), Object.prototype.valueOf])).to.equal("/^regex$/, Date, and function");
  });

  it("should use the conjunction when the list has three values", () => {
    expect(valuesToString([null, undefined, NaN], { conjunction: "or" })).to.equal("null, undefined, or NaN");
    expect(valuesToString([0, 1, 2], { conjunction: "or" })).to.equal("0, 1, or 2");
    expect(valuesToString([true, false, "maybe"], { conjunction: "or" })).to.equal('true, false, or "maybe"');
    expect(valuesToString(["Fred", "Wilma", "Pebbles"], { conjunction: "or" })).to.equal('"Fred", "Wilma", or "Pebbles"');
    expect(valuesToString([{}, { foo: 1 }, { foo: 1, bar: 2 }], { conjunction: "or" })).to.equal("{}, {foo}, or {foo,bar}");
    expect(valuesToString([/^regex$/, new Date(), Object.prototype.valueOf], { conjunction: "or" })).to.equal("/^regex$/, Date, or function");
  });

  it("should join a list of many values", () => {
    expect(valuesToString([null, undefined, NaN, false, 0, ""]))
      .to.equal('null, undefined, NaN, false, 0, and ""');

    expect(valuesToString([400, 401, 404, 409, 500]))
      .to.equal("400, 401, 404, 409, and 500");

    expect(valuesToString([true, false, "maybe", "possibly", "yes", "no", "definitely not"]))
      .to.equal('true, false, "maybe", "possibly", "yes", "no", and "definitely not"');

    expect(valuesToString(["Fred", "Wilma", "Pebbles", "Barney", "Betty", "Bam Bam"]))
      .to.equal('"Fred", "Wilma", "Pebbles", "Barney", "Betty", and "Bam Bam"');

    expect(valuesToString([{}, { foo: 1 }, { foo: 1, bar: 2 }, /^regex$/, new Date(), Object.prototype.valueOf]))
      .to.equal("{}, {foo}, {foo,bar}, /^regex$/, Date, and function");
  });

  it("should use the conjunction when the list has many values", () => {
    expect(valuesToString([null, undefined, NaN, false, 0, ""], { conjunction: "or" }))
      .to.equal('null, undefined, NaN, false, 0, or ""');

    expect(valuesToString([400, 401, 404, 409, 500], { conjunction: "or" }))
      .to.equal("400, 401, 404, 409, or 500");

    expect(valuesToString([true, false, "maybe", "possibly", "yes", "no", "definitely not"], { conjunction: "or" }))
      .to.equal('true, false, "maybe", "possibly", "yes", "no", or "definitely not"');

    expect(valuesToString(["Fred", "Wilma", "Pebbles", "Barney", "Betty", "Bam Bam"], { conjunction: "or" }))
      .to.equal('"Fred", "Wilma", "Pebbles", "Barney", "Betty", or "Bam Bam"');

    expect(valuesToString([{}, { foo: 1 }, { foo: 1, bar: 2 }, /^regex$/, new Date(), Object.prototype.valueOf], { conjunction: "or" }))
      .to.equal("{}, {foo}, {foo,bar}, /^regex$/, Date, or function");
  });

});
