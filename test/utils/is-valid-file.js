"use strict";

const { URL } = require("url");
const { expect } = require("chai");

module.exports = isValidFile;

/**
 * Asserts that the given value is a valid `File` object.
 */
function isValidFile (file) {
  expect(file).to.be.a("File");
  expect(file.createdAt).to.be.an.instanceOf(Date);
  expect(file.modifiedAt).to.be.an.instanceOf(Date);
  expect(file.metadata).to.be.an("object");
  expect(file.contents).to.be.an.instanceOf(Buffer);
  expect(file.source).to.be.a("string").and.not.empty;
  expect(new URL(file.source).href).to.equal(file.source);
  expect(file.dir).to.be.a("string");
  expect(file.name).to.be.a("string").and.not.empty;
  expect(file.extension).to.be.a("string");
  expect(file.path).to.be.a("string").and.not.empty;

  expect(file).to.include.keys("sourceMap");
  if (file.sourceMap !== undefined) {
    expect(file.sourceMap).to.be.an("object");
  }

  return true;
}
