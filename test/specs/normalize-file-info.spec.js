"use strict";

const { normalizeFileInfo } = require("../../");
const { expect } = require("chai");
const path = require("path");

describe("normalizeFileInfo() function", () => {

  /**
   * Asserts that the given value is a valid `File` object.
   */
  function isNormalizedFileInfo (info) {
    expect(info).to.be.an("object");
    expect(info.path).to.be.a("string").with.length.of.at.least(1);

    if ("createdAt" in info) {
      expect(info.createdAt).to.be.an.instanceOf(Date);
    }

    if ("modifiedAt" in info) {
      expect(info.modifiedAt).to.be.an.instanceOf(Date);
    }

    if ("metadata" in info) {
      expect(info.metadata).to.be.an("object");
    }

    if ("contents" in info) {
      expect(info.contents).to.be.an.instanceOf(Buffer);
    }

    if ("source" in info) {
      expect(info.source).to.be.a("string").with.length.of.at.least(1);
      expect(new URL(info.source).href).to.equal(info.source);
    }

    if ("sourceMap" in info) {
      expect(info.sourceMap).to.be.an("object");
    }

    return true;
  }

  it("can be called with new", () => {
    // eslint-disable-next-line new-cap
    let file = new normalizeFileInfo({ path: "path/to/my/file.txt" });
    expect(file).to.satisfy(isNormalizedFileInfo);
    expect(file).to.deep.equal({
      path: path.normalize("path/to/my/file.txt"),
    });
  });

  it("can be called with an object with a path property", () => {
    let file = normalizeFileInfo({ path: "path/to/my/file.txt" });
    expect(file).to.satisfy(isNormalizedFileInfo);
    expect(file).to.deep.equal({
      path: path.normalize("path/to/my/file.txt"),
    });
  });

  it("should use custom dates", () => {
    let file = normalizeFileInfo({
      path: "file.txt",
      createdAt: new Date("2005-05-15T05:15:25.035Z"),
      modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
    });

    expect(file).to.satisfy(isNormalizedFileInfo);
    expect(file).to.deep.equal({
      path: "file.txt",
      createdAt: new Date("2005-05-15T05:15:25.035Z"),
      modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
    });
  });

  it("should set custom metadata", () => {
    let file = normalizeFileInfo({
      path: "file.txt",
      metadata: {
        source: "aaaaaaaa",
        sourceMap: { file: "xxxxx" },
        path: "bbbbbbbbb",
        dir: "xxxxx",
        name: "yyyyy",
        extension: "zzzzz",
        createdAt: new Date("2005-05-15T05:15:25.035Z"),
        modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
        foo: true,
        bar: 5,
      }
    });

    expect(file).to.satisfy(isNormalizedFileInfo);
    expect(file).to.deep.equal({
      path: "file.txt",
      metadata: {
        source: "aaaaaaaa",
        sourceMap: { file: "xxxxx" },
        path: "bbbbbbbbb",
        dir: "xxxxx",
        name: "yyyyy",
        extension: "zzzzz",
        createdAt: new Date("2005-05-15T05:15:25.035Z"),
        modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
        foo: true,
        bar: 5,
      },
    });
  });

  it("should ignore unknown properties", () => {
    let file = normalizeFileInfo({
      path: "my/directory/file.txt",
      createdAt: new Date("2005-05-15T05:15:25.035Z"),
      modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
      dir: "xxxxx",
      name: "yyyyy",
      extension: "zzzzz",
      foo: true,
      bar: 5
    });

    expect(file).to.satisfy(isNormalizedFileInfo);
    expect(file).to.deep.equal({
      path: path.normalize("my/directory/file.txt"),
      createdAt: new Date("2005-05-15T05:15:25.035Z"),
      modifiedAt: new Date("2006-06-16T06:16:26.036Z"),
    });
  });

  it("should throw an error if called without any arguments", () => {
    function noArgs () {
      return normalizeFileInfo();
    }

    expect(noArgs).to.throw(TypeError);
    expect(noArgs).to.throw("Invalid CodeEngine file: undefined. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty object", () => {
    function emptyObj () {
      return normalizeFileInfo({});
    }

    expect(emptyObj).to.throw(TypeError);
    expect(emptyObj).to.throw("Invalid CodeEngine file: {}. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty string", () => {
    function emptyString () {
      return normalizeFileInfo("");
    }

    expect(emptyString).to.throw(Error);
    expect(emptyString).to.throw("Invalid CodeEngine file: \"\". Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an invalid argument", () => {
    function invalidArg () {
      return normalizeFileInfo(12345);
    }

    expect(invalidArg).to.throw(TypeError);
    expect(invalidArg).to.throw("Invalid CodeEngine file: 12345. Expected an object with at least a \"path\" property.");
  });

  it("should throw an error if called with an empty path", () => {
    function invalidPath () {
      return normalizeFileInfo({ path: "" });
    }

    expect(invalidPath).to.throw(Error);
    expect(invalidPath).to.throw("The file path must be specified.");
  });

  it("should throw an error if called with an invalid path", () => {
    function invalidPath () {
      return normalizeFileInfo({ path: 12345 });
    }

    expect(invalidPath).to.throw(TypeError);
    expect(invalidPath).to.throw("Invalid CodeEngine file: {path}. Expected an object with at least a \"path\" property.");
  });

});
